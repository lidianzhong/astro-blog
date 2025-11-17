#!/usr/bin/env python3
"""
Convert absolute GitHub URLs in markdown files back to relative URLs.
Downloads images from external CDN and saves them locally.
Usage: python convert_to_relative_urls.py <directory>
"""

import os
import re
import sys
import urllib.request
from pathlib import Path

# GitHub repository configuration
GITHUB_OWNER = "lidianzhong"
GITHUB_REPO = "astro-blog"
GITHUB_BRANCH = "edit"
BASE_URL = f"https://raw.githubusercontent.com/{GITHUB_OWNER}/{GITHUB_REPO}/refs/heads/{GITHUB_BRANCH}"

# External CDN URLs to convert to local paths
# These CDN URLs will be converted to paths relative to the markdown file
EXTERNAL_CDN_BASES = [
    "https://assets.vrite.hzau.top",
    # Add more CDN base URLs here as needed
]

# Track downloaded images to avoid duplicates
downloaded_images = set()


def download_image(url, local_path):
    """Download an image from URL and save it to local_path."""
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # Download the image
        print(f"  Downloading: {url}")
        urllib.request.urlretrieve(url, local_path)
        print(f"  Saved to: {local_path}")
        return True
    except Exception as e:
        print(f"  ✗ Error downloading {url}: {e}")
        return False


def convert_absolute_to_relative(content, file_path, base_content_path):
    """
    Convert absolute GitHub URLs back to relative URLs.
    
    Patterns to match:
    - ![alt](https://raw.githubusercontent.com/lidianzhong/astro-blog/refs/heads/edit/src/content/blog/misc/folder/image.png)
    """
    # Get the directory of the current markdown file relative to base_content_path
    file_dir = os.path.dirname(file_path)
    relative_dir = os.path.relpath(file_dir, base_content_path)
    
    def replace_url(match):
        alt_text = match.group(1)
        full_url = match.group(2)
        
        # Check if it's an external CDN URL
        for cdn_base in EXTERNAL_CDN_BASES:
            if full_url.startswith(cdn_base):
                # Extract image filename from CDN URL
                cdn_path = full_url[len(cdn_base):].lstrip('/')
                image_filename = os.path.basename(cdn_path)
                
                # Get markdown file name without extension
                md_filename = os.path.basename(file_path)
                md_name_without_ext = os.path.splitext(md_filename)[0]
                
                # Create the local directory path
                image_dir = os.path.join(file_dir, md_name_without_ext)
                local_image_path = os.path.join(image_dir, image_filename)
                
                # Download the image if not already downloaded
                if full_url not in downloaded_images:
                    if download_image(full_url, local_image_path):
                        downloaded_images.add(full_url)
                
                # Convert to relative path: ./{md_file_name}/{image_filename}
                relative_path = f"./{md_name_without_ext}/{image_filename}"
                
                return f"![{alt_text}]({relative_path})"
        
        # Check if it's our GitHub raw URL
        if not full_url.startswith(BASE_URL):
            return match.group(0)
        
        # Extract the path after the base URL
        # Remove BASE_URL/src/content/blog/ to get the relative path
        prefix = f"{BASE_URL}/src/content/blog/"
        if not full_url.startswith(prefix):
            return match.group(0)
        
        # Get the path relative to src/content/blog/
        image_rel_path = full_url[len(prefix):]
        
        # Convert back to relative path from current file
        # relative_dir is the directory of the current file relative to blog/
        # image_rel_path is the image path relative to blog/
        
        # Calculate relative path from current file to image
        if relative_dir == '.':
            # File is in the blog root
            relative_path = image_rel_path
        else:
            # Need to calculate relative path
            file_parts = relative_dir.split(os.sep)
            image_parts = image_rel_path.split('/')
            
            # Find common prefix
            common_length = 0
            for i in range(min(len(file_parts), len(image_parts))):
                if file_parts[i] == image_parts[i]:
                    common_length += 1
                else:
                    break
            
            # Build relative path
            up_count = len(file_parts) - common_length
            
            if up_count == 0:
                # Image is in same directory tree
                relative_path = './' + '/'.join(image_parts[common_length:])
            else:
                # Need to go up directories
                relative_path = '../' * up_count + '/'.join(image_parts[common_length:])
        
        return f"![{alt_text}]({relative_path})"
    
    # Match markdown image syntax with absolute URLs: ![alt](https://...)
    # This pattern matches any https:// URL
    pattern = r'!\[(.*?)\]\((https://[^)]+?\.(?:png|jpg|jpeg|gif|svg|webp|bmp))\)'
    
    converted_content = re.sub(pattern, replace_url, content, flags=re.IGNORECASE)
    
    return converted_content


def process_markdown_file(file_path, base_content_path):
    """Process a single markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        converted_content = convert_absolute_to_relative(content, file_path, base_content_path)
        
        # Only write if content changed
        if converted_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(converted_content)
            print(f"✓ Converted: {file_path}")
            return True
        else:
            print(f"○ No changes: {file_path}")
            return False
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False


def process_directory(directory):
    """Process all markdown files in the directory recursively."""
    base_content_path = Path(directory).resolve()
    converted_count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                if process_markdown_file(file_path, base_content_path):
                    converted_count += 1
    
    print(f"\n✓ Conversion complete! {converted_count} file(s) modified.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python convert_to_relative_urls.py <directory>")
        sys.exit(1)
    
    target_dir = sys.argv[1]
    
    if not os.path.isdir(target_dir):
        print(f"Error: Directory '{target_dir}' does not exist.")
        sys.exit(1)
    
    print(f"Converting absolute URLs to relative URLs in: {target_dir}")
    print(f"Base URL: {BASE_URL}\n")
    
    process_directory(target_dir)

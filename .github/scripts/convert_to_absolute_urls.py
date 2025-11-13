#!/usr/bin/env python3
"""
Convert relative image URLs in markdown files to absolute GitHub URLs.
Usage: python convert_to_absolute_urls.py <directory>
"""

import os
import re
import sys
from pathlib import Path

# GitHub repository configuration
GITHUB_OWNER = "lidianzhong"
GITHUB_REPO = "astro-blog"
GITHUB_BRANCH = "edit"
BASE_URL = f"https://raw.githubusercontent.com/{GITHUB_OWNER}/{GITHUB_REPO}/refs/heads/{GITHUB_BRANCH}"


def convert_relative_to_absolute(content, file_path, base_content_path):
    """
    Convert relative image URLs to absolute GitHub URLs.
    
    Patterns to match:
    - ![alt](./folder/image.png)
    - ![alt](folder/image.png)
    - ![alt](../folder/image.png)
    """
    # Get the directory of the current markdown file relative to base_content_path
    file_dir = os.path.dirname(file_path)
    relative_dir = os.path.relpath(file_dir, base_content_path)
    
    def replace_url(match):
        alt_text = match.group(1)
        image_path = match.group(2)
        
        # Skip if already an absolute URL
        if image_path.startswith(('http://', 'https://', '//')):
            return match.group(0)
        
        # Resolve the relative path
        if image_path.startswith('./'):
            # Current directory reference
            resolved_path = os.path.join(relative_dir, image_path[2:])
        elif image_path.startswith('../'):
            # Parent directory reference
            resolved_path = os.path.normpath(os.path.join(relative_dir, image_path))
        else:
            # Relative to current file
            resolved_path = os.path.join(relative_dir, image_path)
        
        # Convert Windows backslashes to forward slashes
        resolved_path = resolved_path.replace('\\', '/')
        
        # Create absolute GitHub URL for all relative images
        absolute_url = f"{BASE_URL}/src/content/blog/{resolved_path}"
        
        return f"![{alt_text}]({absolute_url})"
    
    # Match markdown image syntax: ![alt](path)
    pattern = r'!\[(.*?)\]\(([^)]+?\.(?:png|jpg|jpeg|gif|svg|webp|bmp))\)'
    
    converted_content = re.sub(pattern, replace_url, content, flags=re.IGNORECASE)
    
    return converted_content


def process_markdown_file(file_path, base_content_path):
    """Process a single markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        converted_content = convert_relative_to_absolute(content, file_path, base_content_path)
        
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
        print("Usage: python convert_to_absolute_urls.py <directory>")
        sys.exit(1)
    
    target_dir = sys.argv[1]
    
    if not os.path.isdir(target_dir):
        print(f"Error: Directory '{target_dir}' does not exist.")
        sys.exit(1)
    
    print(f"Converting relative URLs to absolute URLs in: {target_dir}")
    print(f"Base URL: {BASE_URL}\n")
    
    process_directory(target_dir)

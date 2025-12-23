#!/usr/bin/env python3
"""Search implementation for FastMCP documentation using minsearch"""
import os
import zipfile
import requests
from pathlib import Path
from typing import List, Dict
from minsearch import Index

# Configuration
ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
ZIP_FILENAME = "main.zip"
WORK_DIR = Path(__file__).parent


def download_zip_if_needed() -> Path:
    """Download the FastMCP repository zip if it doesn't already exist.
    
    Returns:
        Path to the zip file
    """
    zip_path = WORK_DIR / ZIP_FILENAME
    
    if zip_path.exists():
        print(f"✓ Zip file already exists: {zip_path}")
        return zip_path
    
    print(f"Downloading {ZIP_URL}...")
    response = requests.get(ZIP_URL, stream=True)
    response.raise_for_status()
    
    with open(zip_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f"✓ Downloaded {zip_path}")
    return zip_path


def extract_and_process_files(zip_path: Path) -> List[Dict[str, str]]:
    """Extract zip file and process .md and .mdx files.
    
    Args:
        zip_path: Path to the zip file
        
    Returns:
        List of documents with 'filename' and 'content' fields
    """
    documents = []
    
    print(f"Extracting and processing files from {zip_path}...")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Get all file names in the zip
        all_files = zip_ref.namelist()
        
        # Filter for .md and .mdx files
        md_files = [f for f in all_files if f.endswith(('.md', '.mdx'))]
        
        print(f"Found {len(md_files)} .md/.mdx files")
        
        for file_path in md_files:
            try:
                # Read file content
                content = zip_ref.read(file_path).decode('utf-8')
                
                # Remove the first path component
                # e.g., "fastmcp-main/docs/getting-started/welcome.mdx" -> "docs/getting-started/welcome.mdx"
                path_parts = file_path.split('/', 1)
                if len(path_parts) > 1:
                    filename = path_parts[1]
                else:
                    filename = file_path
                
                documents.append({
                    "filename": filename,
                    "content": content
                })
                
            except Exception as e:
                print(f"Warning: Could not process {file_path}: {e}")
                continue
    
    print(f"✓ Processed {len(documents)} documents")
    return documents


def create_index(documents: List[Dict[str, str]]) -> Index:
    """Create and fit a minsearch index with the documents.
    
    Args:
        documents: List of documents with 'filename' and 'content' fields
        
    Returns:
        Fitted Index object
    """
    print("Creating search index...")
    
    index = Index(
        text_fields=["content"],
        keyword_fields=["filename"]
    )
    
    index.fit(documents)
    
    print(f"✓ Index created with {len(documents)} documents")
    return index


def search(index: Index, query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """Search the index and return the most relevant documents.
    
    Args:
        index: The minsearch Index object
        query: Search query string
        num_results: Number of results to return (default: 5)
        
    Returns:
        List of documents matching the query, each with 'filename' and 'content' fields
    """
    results = index.search(query, num_results=num_results)
    return results


# Global index variable to cache the index
_index = None


def get_index() -> Index:
    """Get or create the search index (cached).
    
    Returns:
        The search index
    """
    global _index
    
    if _index is None:
        zip_path = download_zip_if_needed()
        documents = extract_and_process_files(zip_path)
        _index = create_index(documents)
    
    return _index


def search_docs(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """Main search function that handles index creation and searching.
    
    Args:
        query: Search query string
        num_results: Number of results to return (default: 5)
        
    Returns:
        List of documents matching the query
    """
    index = get_index()
    return search(index, query, num_results)


if __name__ == "__main__":
    # Test the implementation
    print("=" * 60)
    print("Testing FastMCP Documentation Search")
    print("=" * 60)
    print()
    
    # Test queries
    test_queries = [
        "getting started",
        "MCP server",
        "tools",
        "installation",
    ]
    
    for query in test_queries:
        print(f"Searching for: '{query}'")
        print("-" * 60)
        
        try:
            results = search_docs(query, num_results=5)
            
            print(f"Found {len(results)} results:")
            for i, doc in enumerate(results, 1):
                print(f"\n{i}. {doc.get('filename', 'Unknown')}")
                # Show first 200 characters of content
                content_preview = doc.get('content', '')[:200]
                print(f"   Preview: {content_preview}...")
            
            print()
            
        except Exception as e:
            print(f"Error searching for '{query}': {e}")
            print()
    
    print("=" * 60)
    print("Test completed!")


# server.py
import os
import requests
from dotenv import load_dotenv
from fastmcp import FastMCP

# Import search functionality
try:
    from search import search_docs
except ImportError as e:
    # Handle import error gracefully
    search_docs = None
    print(f"Warning: Could not import search_docs: {e}")

# Load environment variables from .env file
load_dotenv()

# Get JINA_API_KEY from environment variables
JINA_API_KEY = os.getenv("JINA_API_KEY")

if not JINA_API_KEY:
    raise ValueError(
        "JINA_API_KEY not found. Please set it in your .env file or environment variables."
    )

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

def _download_webpage_impl(url: str) -> str:
    """Internal implementation for downloading web page content using Jina AI's Reader API.
    
    Args:
        url: The URL of the web page to download
        
    Returns:
        The content of the web page as a string
    """
    if not JINA_API_KEY:
        raise ValueError(
            "JINA_API_KEY not found. Please set it in your .env file or environment variables."
        )
    
    headers = {
        "Authorization": f"Bearer {JINA_API_KEY}",
        "Accept": "application/json"
    }
    
    response = requests.get(f"https://r.jina.ai/{url}", headers=headers)
    response.raise_for_status()
    
    return response.text

@mcp.tool
def download_webpage(url: str) -> str:
    """Download and return the content of a web page using Jina AI's Reader API.
    
    Args:
        url: The URL of the web page to download
        
    Returns:
        The content of the web page as a string
    """
    return _download_webpage_impl(url)

def _search_fastmcp_docs_impl(query: str, num_results: int = 5) -> str:
    """Internal implementation for searching FastMCP documentation.
    
    Args:
        query: Search query string
        num_results: Number of results to return (default: 5)
        
    Returns:
        Formatted string with search results including filenames and content previews
    """
    if search_docs is None:
        return "Error: Search functionality is not available. Please ensure search.py is available."
    
    try:
        # Call search_docs from search.py
        results = search_docs(query, num_results=num_results)
        
        if not results:
            return f"No results found for query: '{query}'"
        
        # Format results as a readable string
        output = [f"Found {len(results)} results for '{query}':\n"]
        
        for i, doc in enumerate(results, 1):
            filename = doc.get('filename', 'Unknown')
            content = doc.get('content', '')
            # Preview first 250 characters of content
            content_preview = content[:250].replace('\n', ' ').strip()
            if len(content) > 250:
                content_preview += "..."
            
            output.append(f"{i}. {filename}")
            output.append(f"   Preview: {content_preview}\n")
        
        return "\n".join(output)
        
    except Exception as e:
        return f"Error searching FastMCP documentation: {str(e)}"

@mcp.tool
def search_fastmcp_docs(query: str, num_results: int = 5) -> str:
    """Search the FastMCP documentation index.
    
    Searches through the indexed FastMCP documentation (markdown files)
    and returns the most relevant documents matching the query.
    
    Args:
        query: Search query string
        num_results: Number of results to return (default: 5, max recommended: 10)
        
    Returns:
        Formatted string with search results including filenames and content previews
    """
    return _search_fastmcp_docs_impl(query, num_results)

if __name__ == "__main__":
    mcp.run()
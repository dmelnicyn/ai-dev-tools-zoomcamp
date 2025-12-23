# Homework Answers

## Question 1: Create a New Project
In uv.lock, what's the first hash in the wheels section of fastmcp? Include the entire string without quotes.

**Answer:** sha256:fb3e365cc1d52573ab89caeba9944dd4b056149097be169bce428e011f0a57e5

## Question 2: FastMCP Transport
What's the transport written on the welcome screen when you ran server.py?

**Answer:** STDIO

## Question 3: Scrape Web Tool
How many characters does the tool for downloading content of any web page return when retrieves the content of "https://github.com/alexeygrigorev/minsearch"?

**Answer:** 37034

## Question 4: Integrate the Tool
How many times the word "data" appears in https://datatalks.club/ when using available MCP tools for that?

**Answer:** 90

## Question 5: Implement Search (2 points)
What's the first file returned that you get when querying "demo" in the implemented search function?

**Answer:** examples/testing_demo/README.md

## Question 6: Search Tool (ungraded)
Provide the design description of documentation search engine implemented as server.py as the part of this project in Cursor

**Answer:**

The documentation search engine is implemented as an MCP (Model Context Protocol) tool in `server.py` that enables semantic search over the FastMCP documentation repository. The design follows a modular architecture:

**Architecture:**
- **Data Source**: The search engine downloads the FastMCP repository as a ZIP file from GitHub (`https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip`)
- **Indexing Pipeline**: 
  - Extracts and processes all `.md` and `.mdx` files from the repository
  - Normalizes file paths by removing the root directory prefix (e.g., "fastmcp-main/docs/..." becomes "docs/...")
  - Creates a searchable index using the `minsearch` library with TF-IDF vectorization
- **Search Implementation**: Uses `minsearch.Index` with:
  - `text_fields=["content"]` for full-text search over document content
  - `keyword_fields=["filename"]` for exact filename matching
  - Returns top-k most relevant documents based on cosine similarity

**Key Features:**
- **Lazy Loading**: The index is created on first use and cached in memory for subsequent searches
- **Caching**: The ZIP file is downloaded only once and reused for index creation
- **Error Handling**: Gracefully handles missing dependencies, empty results, and search errors
- **MCP Integration**: Exposed as `search_fastmcp_docs` tool that accepts a query string and optional `num_results` parameter (default: 5)

**Output Format:**
The tool returns a formatted string with:
- Total number of results found
- For each result: filename and a 250-character content preview

**Implementation Details:**
- The core search logic is implemented in `search.py` with functions for downloading, extracting, indexing, and searching
- `server.py` wraps this functionality as an MCP tool, providing a clean interface for Cursor to use
- The search uses scikit-learn's TF-IDF vectorizer under the hood for relevance scoring

This design enables efficient, semantic search over the entire FastMCP documentation corpus, making it easy for developers to find relevant information when working with FastMCP in Cursor.


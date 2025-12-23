#!/usr/bin/env python3
"""Test script for MCP server tools"""
import os
from dotenv import load_dotenv
from server import _download_webpage_impl, _search_fastmcp_docs_impl

# Load environment variables
load_dotenv()

def test_download_webpage():
    """Test the download_webpage function with a GitHub repository URL"""
    test_url = "https://github.com/alexeygrigorev/minsearch"
    
    print(f"Testing download_webpage with URL: {test_url}")
    print("-" * 60)
    
    try:
        content = _download_webpage_impl(test_url)
        
        print(f"✓ Successfully downloaded content")
        print(f"✓ Content length: {len(content)} characters")
        print("-" * 60)
        print("First 500 characters of content:")
        print("-" * 60)
        print(content[:500])
        print("-" * 60)
        print("...")
        print(f"(Total: {len(content)} characters)")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_search_fastmcp_docs():
    """Test the search_fastmcp_docs tool"""
    print("\n" + "=" * 60)
    print("Testing search_fastmcp_docs tool")
    print("=" * 60)
    
    all_tests_passed = True
    
    # Test 1: Basic search functionality
    print("\nTest 1: Basic search functionality")
    print("-" * 60)
    try:
        results = _search_fastmcp_docs_impl("demo", num_results=5)
        assert isinstance(results, str), "Results should be a string"
        assert len(results) > 0, "Results should not be empty"
        assert "Found" in results or "results" in results.lower(), "Results should contain result count"
        assert any(char.isdigit() for char in results), "Results should contain numbers"
        print("✓ Basic search test passed")
        print(f"  Result preview: {results[:200]}...")
    except AssertionError as e:
        print(f"✗ Basic search test failed: {e}")
        all_tests_passed = False
    except Exception as e:
        print(f"✗ Basic search test error: {e}")
        all_tests_passed = False
    
    # Test 2: Search with custom num_results
    print("\nTest 2: Search with custom num_results")
    print("-" * 60)
    try:
        results = _search_fastmcp_docs_impl("getting started", num_results=3)
        assert isinstance(results, str), "Results should be a string"
        # Count result items (lines starting with numbers)
        result_lines = [line for line in results.split('\n') if line.strip().startswith(('1.', '2.', '3.', '4.', '5.'))]
        assert len(result_lines) <= 3, f"Should return at most 3 results, got {len(result_lines)}"
        print("✓ Custom num_results test passed")
        print(f"  Found {len(result_lines)} result items")
    except AssertionError as e:
        print(f"✗ Custom num_results test failed: {e}")
        all_tests_passed = False
    except Exception as e:
        print(f"✗ Custom num_results test error: {e}")
        all_tests_passed = False
    
    # Test 3: Search with no results (edge case)
    print("\nTest 3: Search with no results (edge case)")
    print("-" * 60)
    try:
        results = _search_fastmcp_docs_impl("xyzabc123nonexistentquery", num_results=5)
        assert isinstance(results, str), "Results should be a string"
        # Should handle gracefully - either empty results message or actual results
        assert len(results) > 0, "Should return a message even for no results"
        print("✓ No results test passed")
        print(f"  Response: {results[:150]}...")
    except AssertionError as e:
        print(f"✗ No results test failed: {e}")
        all_tests_passed = False
    except Exception as e:
        print(f"✗ No results test error: {e}")
        all_tests_passed = False
    
    # Test 4: Verify result format
    print("\nTest 4: Verify result format")
    print("-" * 60)
    try:
        results = _search_fastmcp_docs_impl("tools", num_results=2)
        assert isinstance(results, str), "Results should be a string"
        # Check that results include filenames (look for common patterns)
        has_docs = 'docs/' in results
        has_md = '.md' in results or '.mdx' in results
        has_numbered = any(line.strip().startswith(('1.', '2.')) for line in results.split('\n'))
        has_filename_pattern = has_docs or has_md or has_numbered
        assert has_filename_pattern, "Results should include filenames or numbered items"
        # Check that results include previews
        assert "Preview:" in results, "Results should include content previews"
        print("✓ Result format test passed")
        print(f"  Format check: Contains filenames and previews")
    except AssertionError as e:
        print(f"✗ Result format test failed: {e}")
        all_tests_passed = False
    except Exception as e:
        print(f"✗ Result format test error: {e}")
        all_tests_passed = False
    
    return all_tests_passed


if __name__ == "__main__":
    print("=" * 60)
    print("MCP Server Tools Test Suite")
    print("=" * 60)
    
    # Test download_webpage
    test1_passed = test_download_webpage()
    
    # Test search_fastmcp_docs
    test2_passed = test_search_fastmcp_docs()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"download_webpage: {'✓ PASSED' if test1_passed else '✗ FAILED'}")
    print(f"search_fastmcp_docs: {'✓ PASSED' if test2_passed else '✗ FAILED'}")
    print("=" * 60)
    
    exit(0 if (test1_passed and test2_passed) else 1)


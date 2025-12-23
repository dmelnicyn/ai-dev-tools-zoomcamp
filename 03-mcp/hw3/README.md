# HW3 - MCP Server

## Setup

### 1. Install Dependencies

```bash
uv sync
```

### 2. Configure API Key

**IMPORTANT: Never commit your API key to version control!**

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your actual Jina AI API key:
   ```
   JINA_API_KEY=your_actual_api_key_here
   ```

3. The `.env` file is already in `.gitignore` and will not be committed.

### 3. Run the Server

```bash
python server.py
```

## Security Best Practices

- ✅ API keys are stored in `.env` file (not committed to git)
- ✅ Environment variables are loaded using `python-dotenv`
- ✅ The code validates that the API key is present before running
- ✅ Never hardcode API keys in source code
- ✅ Never commit `.env` files to version control

## Alternative: System Environment Variables

Instead of using a `.env` file, you can also set the API key as a system environment variable:

```bash
export JINA_API_KEY=your_actual_api_key_here
python server.py
```

## Using with Cursor

The MCP server has been configured for use with Cursor. The configuration file is located at:

```
/home/dmelnitsyn/ai-dev-tools-zoomcamp/.cursor/mcp.json
```

### To use the `download_webpage` tool in Cursor:

1. **Restart Cursor** - After the configuration is in place, restart Cursor completely for the MCP server to be loaded.

2. **Verify the connection** - Ask Cursor: "What tools do you have available?" It should list `download_webpage` and `add`.

3. **Use the tool** - Simply ask Cursor to download web pages:
   - "Download the content from https://example.com"
   - "Use download_webpage to fetch https://github.com/user/repo"
   - "Get the content of [any URL]"

The tool will automatically use your `JINA_API_KEY` from the `.env` file in this directory.

### Troubleshooting

If the tool doesn't appear:
- Ensure Cursor is restarted
- Check that the `.env` file contains a valid `JINA_API_KEY`
- Verify the server can run manually: `uv run server.py` (should start without errors)
- Check Cursor's MCP connection status in the status bar


# todomd

`@andrewshell/todomd` is a CLI tool designed to help you manage `@TODO` comments in your codebase. It scans your project for `@TODO` comments, aggregates them into a Markdown file, and provides an optional web interface for viewing and managing them.

## Installation

Install `todomd` globally using npm:

```bash
npm install -g @andrewshell/todomd
```

## Usage

The `todomd` CLI supports the following commands:

### General Usage
```bash
todomd [options] [command] [dir]
```

### Options
- `-V, --version`  Output the version number
- `-h, --help`     Display help for command

### Commands
- `scan [dir]`     Scan a directory for `@TODO` comments and generate a `TODO.md` file
- `serve [dir]`    Start a web interface to view and manage todos

### Environment Variables
- `PORT`: Specify the port for the `serve` command (default: `3000`)
- `TODOMD_FILENAME`: Change the default file name from `TODO.md`
- `TODOMD_TITLE`: Customize the top level heading in the Markdown file (default: `TODOs`)

## Comment Formatting

`@TODO` comments can be written in various formats. The tool identifies comments containing `@TODO` or `@TODO:` (case-insensitive) and groups lines with matching prefixes.

### Single-line Comments
```javascript
// @TODO This is a single-line TODO
```

### Multi-line Comments
```javascript
// @TODO Multiple lines
//  are no problem.
```

### Block Comments
```javascript
/**
 * @TODO This also works
 *  with multiple lines
 */
```

### Python-Style Comments
```python
# @TODO This is a single-line TODO in Python
#  This line continues the TODO block
```

### Nodemon Configuration
If your project uses a `nodemon.json` configuration file, `todomd` will respect the specified `watch`, `ext`, and `ignore` settings to determine which folders and file extensions to scan. For example:

`nodemon.json`
```json
{
  "watch": ["src"],
  "ext": "js,jsx",
  "ignore": ["data"]
}
```
This configuration instructs `todomd` to:
- Watch the `src` directory
- Scan files with the extensions `js` and `jsx`
- Ignore the `data` directory

### Parsing Rules
- The tool uses the prefix of the `@TODO` comment (e.g., `//`, `/*`) to determine which lines belong to the same comment block.
- Lines starting with the same prefix and followed by two spaces are included in the comment block.

Example:
```javascript
// @TODO This comment has a prefix of two slashes
//  This line is part of the same TODO block
// But this one is not included because of a single space
```

## Commands in Detail

### `todomd scan` (default command)
Scans the specified directory (or the current directory if none is specified) for `@TODO` comments. It generates or updates a `TODO.md` file in the same directory, listing all identified `@TODO` comments.

The generated `TODO.md` includes:
- A bulleted list of `@TODO` comments
- Links to the relevant file and lines (formatted for GitHub compatibility)

### `todomd serve`
Starts a local web server to view and manage your `@TODO` list via a web interface. The `TODO.md` file is updated automatically as you manage items through the interface.

#### Customizing the Web Server
- Use the `PORT` environment variable to specify a custom port:
  ```bash
  PORT=5000 todomd serve
  ```
- Use the `TODOMD_FILENAME` environment variable to specify a custom filename:
  ```bash
  TODOMD_FILENAME=MY_TODOS.md todomd serve
  ```

## Example `TODO.md` File

```markdown
# TODOs

- Review user feedback on UI design (added manually without link)
- Fix bug in authentication module [auth.js:45](auth.js#L45)
- Improve error handling in payment gateway [payment.js:88](payment.js#L88)
```

## License

This project is licensed under the MIT License.

---

Feel free to contribute, report issues, or suggest features on [GitHub](https://github.com/andrewshell/todomd).

Happy coding!

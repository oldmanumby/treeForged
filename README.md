![Logo](logo.png)

# treePhorge

A Markdown/ASCII tree diagram and structure generator. Designed and tested for AI readability. All contained in a simple HTML file for easy local runs.

## Input Methods

Create directory trees in two ways:

1. Regular Tree Format:

   Use indentation with two spaces per pathway; slashes are optional.

   ```
   Root/
     File1.txt
     Folder1/
       File2.md
       File3.html
   ```

2. Markdown Format:

   Paste or type a markdown outline; use headers and lists.

   ```
   # Root
   - File1.txt
   ## Folder1
   - File2.md
   - File3.html
   ```

### Comments & Metadata

Add comments to any folder or file using `#`. Comments will be auto-aligned in the final diagram. Each comment will be preserved during export as separate `..._comments.txt` files within the folder they belong:

```
Root/           # Main project folder
  src/          # Source code
    index.js    # Entry point
  README.md     # Documentation
```

## Theme Settings

- **Dark Mode:** Switch between light and dark themes for better visibility.
- **Preserve Ordering:** Should your folders and/or files have numbering or lettering as part of their outline, this toggle will preserve that list structure (e.g., "1. File.txt" or "a. File.txt").
- **Trailing Folder Slash:** Toggle the trailing slash `/` after folder names.
- **Connected Roots:** Toggle the vertical pathway connecting the root folders.

## Display Settings

- **Folder Icons:** Show 📁 before folder names (non-ASCII emoji).
- **File Icons:** Show 📄 before file names (non-ASCII emoji).
- **All Caps:** Convert all names to uppercase.

## Format Settings

**Find & Replace:** Advanced text replacement system with preset options and custom rules.

- **Custom Rules:** Add unlimited find-and-replace rules that apply to all file and folder names
- **Preset Buttons:** Quick-access buttons for common replacements:
  - **Spaces:** Convert to underscore, dash, plus, or remove entirely
  - **Underscores:** Convert to dash, plus, space, or remove
  - **Dashes:** Convert to underscore, plus, space, or remove
  - **Pluses:** Convert to underscore, dash, space, or remove
- **Rule Management:** Add, edit, and remove rules individually or clear all at once
- **Real-time Preview:** See changes applied instantly in the tree diagram

**Export Format:** Choose how files are exported:

- **Text:** Export all files as text `.txt` files (default).
- **HTML:** Export all files as web `.html` files.
- **Markdown:** Export all files as markdown `.md` files.
- **Keep Original:** Preserve existing extensions; else `.txt` without extensions.

**Export Options:** Control what gets included in the exported archive:

- **Include Comments:** Export comment files alongside the directory structure
- **Include Original Input:** Add a file containing your original input text
- **Include Converted Output:** Add a file containing the generated tree diagram

## Markdown Features

- Paste any markdown list or outline to convert it instantly.
- Headers (`#, ##, ###, ####, ####, #####, ######`) are converted to folders.
- List items (`-, *, +`) are converted to files.
- Numbered and lettered lists (`1., 2., a., b.`) are supported.
- Automatic conversion when you paste markdown.
- Markdown is converted as typed when `Enter` is pressed.
- Proper indentation is maintained based on header pathways.

## Find & Replace System

The advanced Find & Replace system allows you to transform file and folder names with powerful text replacement rules:

### Custom Rules
- **Add Unlimited Rules:** Create as many find-and-replace rules as needed
- **Real-time Application:** Changes are applied instantly to the tree diagram
- **Export Integration:** All rules are applied to filenames during export
- **Rule Management:** Edit existing rules or remove them individually

### Preset Options
Quick-access buttons for common text transformations:

- **Space Handling:** Convert spaces to underscores, dashes, plus signs, or remove them entirely
- **Underscore Conversion:** Transform underscores to dashes, plus signs, spaces, or remove them
- **Dash Transformation:** Change dashes to underscores, plus signs, spaces, or remove them
- **Plus Sign Handling:** Convert plus signs to underscores, dashes, spaces, or remove them

### Usage Examples
```
Original: "My Project Files/Source Code/main file.js"
Rule: " " → "_"
Result: "My_Project_Files/Source_Code/main_file.js"

Original: "project-name/sub-folder/test-file.txt"
Rule: "-" → "_"
Result: "project_name/sub_folder/test_file.txt"
```

## Export Features

- **ZIP Archive:** Files are exported in a convenient `.zip` archive for easy download and extraction
- **Comment Preservation:** Comments are saved as separate `..._comments.txt` files within their respective folders
- **Structure Integrity:** The folder structure is preserved exactly as shown in the tree diagram
- **Smart File Content:** File content is generated based on file type:
  - `.html` files include basic HTML structure with proper DOCTYPE and meta tags
  - `.md` files include a title header based on the filename
  - `.txt` files are created empty and ready for content
- **Optional Inclusions:** Choose to include additional files in your export:
  - Original input text as `_original_input.txt`
  - Generated tree diagram as `_converted_output.txt`
- **Find & Replace Applied:** All custom find-and-replace rules are applied to exported filenames and folder names

## Tips

- **Quick Sharing:** Use the `Copy to Clipboard` button to share your diagram quickly.
- **Persistent Settings:** All settings are saved automatically between sessions.
- **Default Configuration:** Theme settings are `ON` by default for better visualization; Display settings are `OFF` by default for cleaner output.
- **Offline Usage:** Download the latest release and open `index.html` in any browser for desktop use.
- **Find & Replace Efficiency:** Use preset buttons for common transformations, then add custom rules for specific needs.
- **Export Optimization:** Enable "Include Original Input" and "Include Converted Output" for complete project documentation.
- **Markdown Workflow:** Paste markdown outlines directly - they'll be converted automatically to tree format.
- **Comment Organization:** Comments are automatically aligned and exported as separate files for easy reference.

---

**License**

issuePhorge is licensed under the GNU General Public License v3.0 (GPL-3.0). This means you can freely use, modify, and distribute this software, provided that:

- You disclose the source code of your modifications
- You license your modifications under the same GPL-3.0 license
- You preserve the original copyright notices and disclaimers
- See the LICENSE file for the complete text of the GPL-3.0 license.

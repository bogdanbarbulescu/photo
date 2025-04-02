// article.js

document.addEventListener('DOMContentLoaded', () => {
    const articleContentElement = document.getElementById('article-content');
    const articleTitleElement = document.getElementById('article-title');
    const articleMetaElement = document.getElementById('article-meta');

    // --- Helper function to parse simple front matter ---
    // Note: This is a basic parser. For complex YAML, use a dedicated library.
    function parseFrontMatter(text) {
        const frontMatterRegex = /^---\s*([\s\S]*?)\s*---\s*/;
        const match = text.match(frontMatterRegex);
        const metadata = {};
        let content = text;

        if (match) {
            content = text.substring(match[0].length); // Get content after front matter
            const yamlLines = match[1].trim().split('\n');
            yamlLines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    // Join remaining parts in case value contains ':'
                    const value = parts.slice(1).join(':').trim();
                    // Remove surrounding quotes if present
                    metadata[key] = value.replace(/^['"]|['"]$/g, '');
                }
            });
        }
        return { metadata, content };
    }

    // --- Function to load and render the article ---
    async function loadArticle() {
        try {
            // 1. Get the post identifier from the URL query string (?post=...)
            const urlParams = new URLSearchParams(window.location.search);
            const postIdentifier = urlParams.get('post'); // e.g., "chasing-the-aurora-iceland"

            if (!postIdentifier) {
                throw new Error("No article specified in the URL.");
            }

            // 2. Construct the path to the markdown file (assuming it's in an 'articles' folder)
            const filePath = `articles/${postIdentifier}.md`;

            // 3. Fetch the markdown file content
            const response = await fetch(filePath);

            if (!response.ok) {
                throw new Error(`Could not load article. Status: ${response.status}`);
            }

            const markdownText = await response.text();

            // 4. Parse Front Matter and Markdown Content
            const { metadata, content } = parseFrontMatter(markdownText);

            // 5. Render the Markdown content to HTML using Marked.js
            // Security Note: marked.parse converts Markdown to HTML. Ensure your .md files
            // are from trusted sources as this inserts HTML directly.
            // For basic use with your own files, this is generally fine.
            // Consider adding sanitization options if needed: marked.parse(content, { sanitize: true });
            // Note: `sanitize` option is deprecated in newer Marked versions, use DOMPurify instead if needed.
            articleContentElement.innerHTML = marked.parse(content);

            // 6. Update Title and Meta information (if available in front matter)
            const pageTitleBase = "Bogdan Barbulescu Photography";
            if (metadata.title) {
                articleTitleElement.textContent = metadata.title;
                document.title = `${metadata.title} - ${pageTitleBase}`; // Update browser tab title
            } else {
                 articleTitleElement.textContent = "Article"; // Default title
                 document.title = `Article - ${pageTitleBase}`;
            }

            let metaText = '';
            if (metadata.date) {
                metaText += `Published: ${metadata.date}`;
            }
            if (metadata.author) {
                 metaText += `${metadata.date ? ' | ' : ''}By: ${metadata.author}`;
            }
             if (metadata.category) {
                 metaText += `${(metadata.date || metadata.author) ? ' | ' : ''}Category: ${metadata.category}`;
             }
            articleMetaElement.textContent = metaText;


        } catch (error) {
            console.error("Error loading article:", error);
            articleTitleElement.textContent = "Error";
            articleContentElement.innerHTML = `<p class="text-danger">Sorry, the article could not be loaded. Please check the URL or try again later.</p><p><a href="journal.html" class="btn btn-secondary">Back to Journal</a></p>`;
             document.title = `Error - ${pageTitleBase}`;
        }
    }

    // --- Load the article when the page is ready ---
    loadArticle();

});
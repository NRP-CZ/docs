import React from "react";
import { Pre, Code } from "nextra/components";
import {getHighlighter} from "shiki";
import { BUNDLED_LANGUAGES, BUNDLED_THEMES } from 'shiki'
import rehypePrettyCode from 'rehype-pretty-code'

export function useGitHubCode({ repo, branch = "main", path }) {
  const viewUrl = `https://github.com/${repo}/tree/${branch}/${path}`;
  const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
  const [content, setContent] = React.useState(null);
  const extension = path.split(".").pop();
  console.log(rehypePrettyCode)

  React.useEffect(() => {
    async function loadContent() {
      fetch(rawUrl).then(async (response) => {
        const responseText = await response.text();
        setContent(responseText);
      });
    }
    loadContent();
  }, []);

  return { content, extension, viewUrl };
}

export function GitHubCode({ title = "GitHub", repo, branch = "main", path }) {
  const { content, extension, viewUrl } = useGitHubCode({ repo, branch, path });

  const codeProps = { "data-language": extension, "data-theme": "default" };

  if (content) {
    return (
      <Pre filename={viewUrl} hasCopyCode={true} {...codeProps}>
        <Code {...codeProps}>
          {content.split("\n").map((line, lineNum) => (
            <span className="line" key={lineNum}>
              {line}
            </span>
          ))}
        </Code>
      </Pre>
    );
  }
}

export default GitHubCode;

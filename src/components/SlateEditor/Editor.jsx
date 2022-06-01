import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createEditor, Text } from "slate";
import { withHistory } from "slate-history";
import { Slate, Editable, withReact } from "slate-react";
import Toolbar from "./Toolbar/Toolbar";
import { sizeMap, fontFamilyMap } from "./utils/SlateUtilityFunctions.js";
import withLinks from "./plugins/withLinks.js";
import withTables from "./plugins/withTable.js";
import withEmbeds from "./plugins/withEmbeds.js";
import "./Editor.css";
import Link from "./Elements/Link/Link";
import Image from "./Elements/Image/Image";
import Video from "./Elements/Video/Video";
import escapeHtml from "escape-html";

const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "headingOne":
      return <h1 {...attributes}>{children}</h1>;
    case "headingTwo":
      return <h2 {...attributes}>{children}</h2>;
    case "headingThree":
      return <h3 {...attributes}>{children}</h3>;
    case "blockquote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "alignLeft":
      return (
        <div
          style={{ textAlign: "left", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "alignCenter":
      return (
        <div
          style={{ textAlign: "center", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "alignRight":
      return (
        <div
          style={{ textAlign: "right", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "orderedList":
      return (
        <ol type="1" {...attributes}>
          {children}
        </ol>
      );
    case "unorderedList":
      return <ul {...attributes}>{children}</ul>;
    case "link":
      return <Link {...props} />;

    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return <td {...attributes}>{children}</td>;
    case "image":
      return <Image {...props} />;
    case "video":
      return <Video {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.strikethrough) {
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }
  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }
  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }
  if (leaf.bgColor) {
    children = (
      <span style={{ backgroundColor: leaf.bgColor }}>{children}</span>
    );
  }
  if (leaf.fontSize) {
    const size = sizeMap[leaf.fontSize];
    children = <span style={{ fontSize: size }}>{children}</span>;
  }
  if (leaf.fontFamily) {
    const family = fontFamilyMap[leaf.fontFamily];
    children = <span style={{ fontFamily: family }}>{children}</span>;
  }
  return <span {...attributes}>{children}</span>;
};

const SlateEditor = () => {
  const editor = useMemo(
    () =>
      withHistory(withEmbeds(withTables(withLinks(withReact(createEditor()))))),
    []
  );

  const [value, setValue] = useState([
    {
      type: "paragaph",
      children: [{ text: "First line of text in Slate JS. " }]
    }
  ]);

  const renderElement = useCallback((props) => <Element {...props} />, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  const serialize = (node) => {
    if (Text.isText(node)) {
      let string = escapeHtml(node.text);
      if (node.bold) {
        string = `<strong>${string}</strong>`;
      } else if (node.italic) {
        string = `<em>${string}</em>`;
      } else if (node.underline) {
        string = `<u>${string}</u>`;
      } else if (node.color) {
        string = `<span style= "color: ${node.color}">${string}</span>`;
      } else if (node.fontSize) {
        const size = sizeMap[node.fontSize];
        string = `<span style= "font-size: ${size}">${string}</span>`;
      } else if (node.fontFamily) {
        const family = fontFamilyMap[node.fontFamily];
        string = `<span style=" font-family: ${family}">${string}</span>`;
      }
      return string;
    }

    const children = node.children.map((n) => serialize(n)).join("");

    switch (node.type) {
      case "headingOne":
        return `<h1>${children}</h1>`;
      case "headingTwo":
        return `<h2>${children}</h2>`;
      case "headingThree":
        return `<h3>${children}</h3>`;
      case "alignCenter":
        return `<div style="text-align: center" >${children}</div>`;
      case "alignLeft":
        return `<div style="text-align: left" >${children}</div>`;
      case "alignRight":
        return `<div style="text-align: right" >${children}</div>`;
      case "blockquote":
        return `<blockquote><p>${children}</p></blockquote>`;
      case "paragraph":
        return `<p>${children}</p>`;
      case "link":
        return `<a href="${escapeHtml(node.url)}">${children}</a>`;
      default:
        return children;
    }
  };

  const [testhtml, setTesthtml] = useState();

  useEffect(() => {
    if (value) {
      console.log(value);
      let texthtml = `<div>`;
      for (let i = 0; i < value.length; i++) {
        const test = serialize(value[i]);
        texthtml = texthtml + `<br/>` + test;
      }
      texthtml += `</div>`;
      setTesthtml(texthtml);
      console.log(texthtml);
    }
  }, [value]);

  return (
    <>
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
      >
        <Toolbar />
        <div
          className="editor-wrapper"
          style={{ border: "1px solid #f3f3f3", padding: "0 10px" }}
          id="target"
        >
          <Editable
            placeholder="Write something"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
          />
        </div>
      </Slate>{" "}
      <div dangerouslySetInnerHTML={{ __html: testhtml }} />
    </>
  );
};

export default SlateEditor;

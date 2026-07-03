import { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import "./ImageEditor.css";
import API from "../../src/api/axios";

function ImageEditor({ imageUrl, onDone, onCancel }) {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const containerRef = useRef(null);

  const [tagSearch, setTagSearch] = useState("");
  const [tagResults, setTagResults] = useState([]);
  const [image] = useImage(imageUrl);

  const [stageSize, setStageSize] = useState({
    width: 600,
    height: 600,
  });

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [activePanel, setActivePanel] = useState(null);
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(42);

  const emojis = ["😂", "❤️", "🔥", "😍", "😎", "🥳", "✨", "💯", "🌴", "⚽"];

  useEffect(() => {
    const resizeEditor = () => {
      if (!containerRef.current || !image) return;

      const maxWidth = Math.min(containerRef.current.offsetWidth - 24, 760);
      const maxHeight = window.innerHeight * 0.6;
      const ratio = image.width / image.height;

      let width = maxWidth;
      let height = width / ratio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }

      setStageSize({ width, height });
    };

    resizeEditor();

    window.addEventListener("resize", resizeEditor);

    return () => window.removeEventListener("resize", resizeEditor);
  }, [image]);

  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, items]);

  const addText = () => {
    if (!textInput.trim()) return;

    const newItem = {
      id: `text-${Date.now()}`,
      type: "text",
      text: textInput,
      x: stageSize.width / 2 - 80,
      y: stageSize.height / 2 - 20,
      fontSize,
      fill: textColor,
      fontStyle: "bold",
      rotation: 0,
    };

    setItems([...items, newItem]);
    setTextInput("");
    setActivePanel(null);
    setSelectedId(newItem.id);
  };

  const addEmoji = (emoji) => {
    const newItem = {
      id: `emoji-${Date.now()}`,
      type: "emoji",
      text: emoji,
      x: stageSize.width / 2 - 30,
      y: stageSize.height / 2 - 30,
      fontSize: 60,
      fill: "#ffffff",
      fontStyle: "normal",
      rotation: 0,
    };

    setItems([...items, newItem]);
    setActivePanel(null);
    setSelectedId(newItem.id);
  };

  const searchUsers = async (value) => {
    setTagSearch(value);

    if (!value.trim()) {
      setTagResults([]);
      return;
    }

    try {
      const res = await API.get(`/users?search=${value}`);
      setTagResults(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const addTag = (person) => {
    const newItem = {
      id: `tag-${Date.now()}`,
      type: "tag",
      userId: person._id,
      username: person.name,
      text: `@${person.name}`,
      x: stageSize.width / 2 - 60,
      y: stageSize.height / 2,
      fontSize: 24,
      fill: "#ffffff",
      fontStyle: "bold",
      rotation: 0,
    };

    setItems([...items, newItem]);
    setSelectedId(newItem.id);
    setTagSearch("");
    setTagResults([]);
    setActivePanel(null);
  };

  const updateSelected = (changes) => {
    if (!selectedId) return;

    setItems(
      items.map((item) =>
        item.id === selectedId ? { ...item, ...changes } : item
      )
    );
  };

  const deleteSelected = () => {
    if (!selectedId) return;

    setItems(items.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  const exportImage = () => {
    setSelectedId(null);

    setTimeout(() => {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2,
      });

      const taggedUsers = items
        .filter((item) => item.type === "tag" && item.userId)
        .map((item) => item.userId);

      const uniqueTaggedUsers = [...new Set(taggedUsers)];

      onDone(dataURL, uniqueTaggedUsers);
    }, 80);
  };

  return (
    <div className="pro-editor">
      <div className="pro-editor-header">
        <button type="button" onClick={onCancel}>
          ←
        </button>

        <h2>Edit Photo</h2>

        <button type="button" className="done-btn" onClick={exportImage}>
          Done
        </button>
      </div>

      <div className="pro-editor-body" ref={containerRef}>
        <div className="stage-shell">
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            ref={stageRef}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
              }
            }}
            onTouchStart={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
              }
            }}
          >
            <Layer>
              <KonvaImage
                image={image}
                width={stageSize.width}
                height={stageSize.height}
              />

              {items.map((item, index) => (
                <Text
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  x={item.x}
                  y={item.y}
                  fontSize={item.fontSize}
                  fill={item.fill}
                  fontStyle={item.fontStyle}
                  rotation={item.rotation || 0}
                  draggable
                  onClick={() => setSelectedId(item.id)}
                  onTap={() => setSelectedId(item.id)}
                  onDragEnd={(e) => {
                    const updated = [...items];

                    updated[index].x = e.target.x();
                    updated[index].y = e.target.y();

                    setItems(updated);
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();

                    node.scaleX(1);
                    node.scaleY(1);

                    const updated = [...items];

                    updated[index].x = node.x();
                    updated[index].y = node.y();
                    updated[index].fontSize = Math.max(
                      16,
                      item.fontSize * scaleX
                    );
                    updated[index].rotation = node.rotation();

                    setItems(updated);
                  }}
                />
              ))}

              {selectedId && (
                <Transformer
                  ref={transformerRef}
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ]}
                  rotateEnabled={true}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {activePanel === "text" && (
        <div className="editor-panel">
          <input
            type="text"
            placeholder="Type something..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              updateSelected({ fill: e.target.value });
            }}
          />

          <input
            type="range"
            min="18"
            max="100"
            value={fontSize}
            onChange={(e) => {
              const size = Number(e.target.value);
              setFontSize(size);
              updateSelected({ fontSize: size });
            }}
          />

          <button type="button" onClick={addText}>
            Add
          </button>
        </div>
      )}

      {activePanel === "emoji" && (
        <div className="editor-panel emoji-panel">
          {emojis.map((emoji) => (
            <button key={emoji} type="button" onClick={() => addEmoji(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {activePanel === "tag" && (
        <div className="editor-panel tag-panel">
          <input
            type="text"
            placeholder="Search people..."
            value={tagSearch}
            onChange={(e) => searchUsers(e.target.value)}
          />

          <div className="tag-results">
            {tagResults.map((person) => (
              <button
                key={person._id}
                type="button"
                onClick={() => addTag(person)}
              >
                <span className="tag-avatar">
                  {person.profileImage ? (
                    <img src={person.profileImage} alt={person.name} />
                  ) : (
                    person.name?.charAt(0)
                  )}
                </span>

                @{person.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pro-editor-toolbar">
        <button type="button" onClick={() => setActivePanel("emoji")}>
          😊
          <span>Emoji</span>
        </button>

        <button type="button" onClick={() => setActivePanel("text")}>
          Aa
          <span>Text</span>
        </button>

        <button type="button" onClick={() => setActivePanel("tag")}>
          🏷
          <span>Tag</span>
        </button>

        <button type="button">
          ✏️
          <span>Draw</span>
        </button>

        <button type="button">
          🎨
          <span>Filter</span>
        </button>

        <button type="button" onClick={deleteSelected}>
          🗑
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

export default ImageEditor;
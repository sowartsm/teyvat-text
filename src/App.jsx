import { useEffect, useState } from 'react';
import './App.css'
import Header from './components/header';

function App() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedIndexes, setCopiedIndexes] = useState(new Set());
  const [deletedIndexes, setDeletedIndexes] = useState(new Set());
  const [clipboard, setClipboard] = useState(() => {
    // Initialize from localStorage on first render
    const saved = localStorage.getItem('clipboardData');
    return saved ? JSON.parse(saved) : [];
  });

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isColorEnabled, setIsColorEnabled] = useState(false);
  const [color, setColor] = useState('#ff0073');
  const [sizeValue, setSizeValue] = useState('');
  const [limitSignature, setLimitSignature] = useState(false);
  const [isSaved, setIsSaved] = useState(false);


  let formatted = text;
  if (isBold) formatted = `<b>${formatted}</b>`;
  if (isItalic) formatted = `<i>${formatted}</i>`;
  if (sizeValue) formatted = `<size=${sizeValue}>${formatted}</size>`;
  if (isColorEnabled) formatted = `<color=${color}>${formatted}</color>`;
  const wrappedText = formatted;

  const wrappedLength = wrappedText.length;
  const maxLength = limitSignature ? 45 : 80;
  const isTooLong = wrappedLength > maxLength;

  const { color: previewColor, content: previewContent } = parseColoredText(wrappedText);


  // Single effect to handle localStorage updates
  useEffect(() => {
    localStorage.setItem('clipboardData', JSON.stringify(clipboard));
  }, [clipboard]);

  const copyToClipboard = async (textToCopy = wrappedText, index = null) => {
    if (!textToCopy.trim()) return; // Prevent copying empty string

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (index === null) {
        setCopiedIndexes(new Set(['main']));
        setTimeout(() => setCopiedIndexes(new Set()), 1500);
      } else {
        setCopiedIndexes(prev => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        });
        setTimeout(() => {
          setCopiedIndexes(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        }, 1500);
      }

    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const saveToClipboard = () => {
    if (text.trim()) {
      setClipboard(prev => [...prev, wrappedText]);
      setText('');

      // Show "Saved!" temporarily
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1500);
    }
  };



  const handleDelete = (index) => {
    setClipboard(prev => prev.filter((_, i) => i !== index));
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
    }
  };

  function parseColoredText(input) {
    const match = input.match(/^<color=([^>]+)>(.*?)<\/color>$/);
    if (match) {
      const [, color, content] = match;
      return { color, content };
    } else {
      return { color: '', content: input };
    }
  }

  function renderFormattedText(input) {
    let colorMatch = input.match(/<color=([^>]+)>/);
    let color = colorMatch ? colorMatch[1] : '#ffffff';
    input = input.replace(/<color=[^>]+>/, '').replace(/<\/color>/, '');

    let sizeMatch = input.match(/<size=([^>]+)>/);
    let fontSize = sizeMatch ? `${sizeMatch[1]}px` : '1rem';
    input = input.replace(/<size=[^>]+>/, '').replace(/<\/size>/, '');

    const isBold = input.includes('<b>');
    const isItalic = input.includes('<i>');

    input = input.replace(/<\/?[bi]>/g, '');

    const style = {
      color,
      fontSize,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      display: 'inline-block',
      width: '100%',
    };

    return <span style={style}>{input}</span>;
  }



  return (
    <div className="app">
      <Header />
      <main className='main'>
        <div className="container">
          <div className='left'>
            <h2>Input & Operations</h2>
            <div className='input-wrapper'>
              <div className='formatting-bar-wrapper'>
                <div className="formatting-bar">
                  <button
                    className={`format-button ${isBold ? 'active' : ''}`}
                    onClick={() => setIsBold(!isBold)}
                  >
                    <b>B</b>
                  </button>

                  <button
                    className={`format-button ${isItalic ? 'active' : ''}`}
                    onClick={() => setIsItalic(!isItalic)}
                  >
                    <i>I</i>
                  </button>
                  <button
                    className={`format-button ${isColorEnabled ? 'active' : ''}`}
                    onClick={() => setIsColorEnabled(!isColorEnabled)}
                  >

                    🎨
                  </button>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={!isColorEnabled}
                  />
                  <input
                    type="number"
                    placeholder="Size"
                    min="10"
                    value={sizeValue}
                    onChange={(e) => setSizeValue(e.target.value)}
                    style={{ width: '60px', paddingLeft: '5px', borderRadius: '5px' }}
                  />
                  <button
                    className={`format-button ${limitSignature ? 'active' : ''}`}
                    onClick={() => setLimitSignature(prev => !prev)}
                    title="Toggle Signature Mode"
                  >
                    Sig
                  </button>

                </div>
              </div>
              <textarea
                rows='2'
                cols='30'
                maxLength={72}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Type here...'
              />
              <button className="paste-btn" onClick={pasteFromClipboard}>
                Paste
              </button>

              <button onClick={() => setText('')}>Clear</button>
            </div>
            <div className="output-wrapper">
              <p className="output">
                {text.trim() ? renderFormattedText(wrappedText) : null}
              </p>




              {isTooLong && (
                <p className="warning-text">
                  ⚠ Output exceeds {maxLength} characters ({wrappedLength}/{maxLength})
                </p>
              )}

              <div className="button-group">
                <button onClick={() => copyToClipboard(wrappedText, 'main')} disabled={isTooLong || !text.trim()}>
                  {copiedIndexes.has('main') ? 'Copied!' : 'Copy'}
                </button>



                <button onClick={saveToClipboard} disabled={isTooLong || !text.trim()}>
                  {isSaved ? 'Saved!' : 'Save'}
                </button>

              </div>

            </div>
          </div>
          <div className="clipboard">
            <div className="clipboard-header">
              <h2>Clipboard</h2>
              {clipboard.length > 0 && (
                <button onClick={() => setClipboard([])} style={{ marginBottom: '0' }}>
                  Clear All
                </button>
              )}
            </div>
            <div className="clipboard-content">
              {clipboard.length === 0 ? (
                <p style={{ color: '#383737' }}>No saved lines yet.</p>
              ) : (
                clipboard.map((item, index) => (
                  <div className='clipboard-item'>
                    <div className="clipboard-preview">
                    </div>
                    <code>{renderFormattedText(item)}</code>
                    <div>
                      <button onClick={() => copyToClipboard(item, index)}>
                        {copiedIndexes.has(index) ? 'Copied!' : 'Copy'}
                      </button>



                      <button onClick={() => handleDelete(index)} style={{ marginLeft: '0.5rem' }}>
                        Delete
                      </button>
                    </div>
                  </div>

                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
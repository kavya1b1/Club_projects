import React from 'react';

function ChatHistoryPanel({ chatHistory, onSelectChat, onNewChat, selectedChatId, isOpen, toggleOpen }) {
  const entries = Object.entries(chatHistory).filter(
    ([id, chat]) => chat.messages && chat.messages.length > 0
  );

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isOpen ? 320 : 40,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        style={{
          position: 'absolute',
          top: 10,
          right: isOpen ? -20 : -10,
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#445dfb',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: '0 2px 8px #222a3b88',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          zIndex: 10,
          transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s ease',
        }}
        aria-label={isOpen ? 'Collapse chat history panel' : 'Expand chat history panel'}
      >
        ▶
      </button>

      {isOpen && (
        <>
          <h2
            style={{
              padding: '14px 12px 10px 12px',
              borderBottom: '1px solid #222a3b',
              color: '#beeaf9',
              fontSize: '1.1rem',
            }}
          >
            🔍 Chat History
          </h2>
          <button style={styles.newChatBtn} onClick={onNewChat}>
            + New Chat
          </button>
          <div style={styles.list}>
            {entries.length === 0 && (
              <p style={{ padding: '10px', color: '#5771bb' }}>No past chats</p>
            )}
            {entries.map(([id, chat]) => {
              const lastMsg = chat.messages[chat.messages.length - 1]?.content || 'Empty chat';
              const isSelected = id === selectedChatId;
              return (
                <div
                  key={id}
                  style={{
                    ...styles.chatItem,
                    backgroundColor: isSelected ? '#445dfb' : '#242d48',
                    color: isSelected ? '#fff' : '#aee4ff',
                    border: isSelected ? '2px solid #445dfb' : styles.chatItem.border,
                  }}
                  onClick={() => onSelectChat(id)}
                >
                  <div style={{ fontWeight: 'bold', color: isSelected ? '#fff' : '#beeaf9' }}>
                    {chat.modelName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      marginTop: 3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: isSelected ? '#eafcff' : '#8caadb',
                    }}
                  >
                    {lastMsg}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  sidebar: {
    borderRight: '1.5px solid #222a3b',
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: '#161b28',
    boxSizing: 'border-box',
  },
  newChatBtn: {
    margin: 12,
    padding: '10px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: 8,
    background: 'linear-gradient(90deg,#384169 60%,#394f83 100%)',
    color: '#aee4ff',
    border: 'none',
    fontSize: '1rem',
    boxShadow: '0 2px 8px #222a3b44',
  },
  list: {
    padding: 8,
  },
  chatItem: {
    padding: 11,
    borderRadius: 7,
    marginBottom: 7,
    cursor: 'pointer',
    backgroundColor: '#242d48',
    color: '#d6daf8',
    border: '1.1px solid #313d5b',
    transition: 'background 0.16s',
  },
};

export default ChatHistoryPanel;

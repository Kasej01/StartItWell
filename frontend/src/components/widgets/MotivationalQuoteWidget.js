import React, { useEffect, useState } from 'react';
import '../styles/MotivationalQuoteWidget.css';

// Utility to parse CSV
function parseCSV(csv) {
  return csv
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [text, author] = line.split(',');
      return { text: text?.trim(), author: author?.trim() || 'Unknown' };
    })
    .filter(q => q.text);
}

// Quote of the day for all users
function getQuoteOfTheDay(quotes) {
  if (!quotes.length) return { text: '', author: '' };
  const today = new Date();
  const dayOfYear = Math.floor(
    (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) -
      Date.UTC(today.getUTCFullYear(), 0, 0)) / 86400000
  );
  const idx = dayOfYear % quotes.length;
  return quotes[idx];
}

const MotivationalQuoteWidget = () => {
  const [quotes, setQuotes] = useState([]);
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/motivationalquotes.csv')
      .then(res => res.text())
      .then(csv => {
        const parsed = parseCSV(csv);
        setQuotes(parsed);
        setQuote(getQuoteOfTheDay(parsed));
      });
  }, []);

  return (
    <div className="motivational-quote-widget">
      <div className="quote-text">{quote.text ? `"${quote.text}"` : 'Loading...'}</div>
      {quote.author && <div className="quote-author">— {quote.author}</div>}
    </div>
  );
};

export default MotivationalQuoteWidget;
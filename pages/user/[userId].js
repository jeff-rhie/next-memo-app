import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UserPage() {
  const router = useRouter();
  const { userId } = router.query;
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to load memos from the API
  const loadMemos = async () => {
    if (!userId) return; // Exit if userId is not yet available

    try {
      const res = await fetch(`/api/user/${userId}/memos`);
      if (!res.ok) {
        throw new Error('Failed to fetch memos');
      }
      const data = await res.json();
      setMemos(data);
    } catch (err) {
      console.error('Error loading memos:', err);
      setError(err.message);
    }
  };

  // Fetch memos when the component mounts and when userId changes
  useEffect(() => {
    if (router.isReady) {
      loadMemos();
    }
  }, [router.isReady, userId]);

  // Handle form submission for new memo
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const content = event.target.memoContent.value;

    try {
      const res = await fetch(`/api/user/${userId}/memos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit memo');
      }

      event.target.memoContent.value = ''; // Clear textarea after successful submission
      await loadMemos(); // Reload memos to display the new one
    } catch (err) {
      console.error('Error submitting memo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>User Memos</h1>
      <form onSubmit={handleSubmit}>
        <textarea id="memoContent" name="memoContent" placeholder="Write your memo here..." required></textarea>
        <button type="submit" disabled={loading}>Submit Memo</button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <h2>Your Memos</h2>
      <div id="memosContainer">
        {memos.length > 0 ? (
          memos.map((memo, index) => (
            <div key={index}>{memo.content}</div> // Consider using a unique id for the key if available
          ))
        ) : (
          <p>No memos found.</p>
        )}
      </div>
    </div>
  );
}


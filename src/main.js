const API_KEY = import.meta.env.VITE_NASA_API_KEY;

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="apod-controls">
    <div id="apod-date" class="apod-date">Loading...</div>
    <button id="random-btn" class="random-btn">Random Date</button>
  </div>
  <div id="apod-content"><p>loading...</p></div>
`;

async function fetchAPOD(date) {
  const url = new URL('https://api.nasa.gov/planetary/apod');
  url.searchParams.set('api_key', API_KEY);
  if (date) url.searchParams.set('date', date);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`NASA API error ${res.status} ${res.statusText}`);
  return res.json();
}

function renderAPOD(data) {
  let media = '';

  if (data.media_type === 'image') {
    media = `<img src="${data.url}" alt="${data.title}"/>`;
  } else if (typeof data.url === 'string' && (data.url.includes('youtube') || data.url.includes('youtu.be'))) {
    const embedUrl = data.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
    media = `<div class="video-wrapper"><iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  } else {
    media = data.url ? `<video src="${data.url}" controls></video>` : `<p>No media available</p>`;
  }

  document.getElementById('apod-date').textContent = data.date || '';
  document.getElementById('apod-content').innerHTML = `
    <h1 class="apod-title">${data.title}</h1>
    ${media}
    <p class="apod-explanation">${data.explanation}</p>
  `;
}

function randomDateString() {
  const start = new Date(1995, 5, 16); 
  const end = new Date();
  const rand = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const y = rand.getFullYear();
  const m = String(rand.getMonth() + 1).padStart(2, '0');
  const d = String(rand.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

document.getElementById('random-btn').addEventListener('click', async () => {
  const date = randomDateString();
  document.getElementById('apod-content').innerHTML = '<p>loading...</p>';
  try {
    const data = await fetchAPOD(date);
    renderAPOD(data);
  } catch (err) {
    document.getElementById('apod-content').innerHTML = `<p>Error: ${err.message}</p>`;
  }
});

fetchAPOD().then(renderAPOD).catch(err => {
  document.getElementById('apod-content').innerHTML = `<p>Error: ${err.message}</p>`;
  document.getElementById('apod-date').textContent = '';
});
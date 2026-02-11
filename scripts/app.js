let songs = [];
let played = [];
let remaining = [];
let player;

fetch('resources/songs.json')
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      songs = data;

      if (localStorage.getItem('played')) {
        played = JSON.parse(localStorage.getItem('played'));
        played.forEach((playedSong) => {
          updateHistoryTable(playedSong)
        });

        const playedVideoIds = new Set(played.map(item => item.videoId));
        remaining = songs.filter((song) => !playedVideoIds.has(song.videoId));

        if (remaining.length === 0) {
          document.getElementById("new-song-button").disabled = true;
          document.getElementById("nowPlaying").innerHTML = '<p>No hay más canciones 😔<br/>¡Empecemos una nueva partida! 🪩</p>';
        }
      } else {
        remaining = [...songs];
      }
    });

function newGame() {
  localStorage.removeItem('played');
  remaining = [...songs];
  document.getElementById("historyTable").innerHTML = "";
  document.getElementById("nowPlaying").textContent = "";
  document.getElementById("new-song-button").disabled = false;
}

function playNewSong() {
  
  document.getElementById("player-box").innerHTML = '<div id="player"></div>';
  const nowPlayingElement = document.getElementById("nowPlaying");
  if (remaining.length === 0) {
    nowPlayingElement.innerHTML = '<p>Se acabó!<br/>¡Empecemos una nueva partida! 🪩</p>';
    document.getElementById("new-song-button").disabled = true;
    return;
  }
  const index = Math.floor(Math.random() * remaining.length);
  console.log(index);
  const song = remaining.splice(index, 1)[0];
  console.log(song);

  configPlayer(song);

  if (localStorage.getItem('played')) {
    played = JSON.parse(localStorage.getItem('played'));
  }
  played.push(song);
  localStorage.setItem("played", JSON.stringify(played));
  updateHistoryTable(song);

  nowPlayingElement.textContent = "Sonando: " + song.author + ' - ' + song.title;
}

function updateHistoryTable(song) {
  let newRow = "<tr><td>" + song.title + "</td><td>" + song.author + "</td><td>" + song.papers.join(", ") + "</td></tr>";
  document.getElementById("historyTable").innerHTML = newRow + document.getElementById("historyTable").innerHTML;
}

function configPlayer(song) {
  player = new YT.Player('player', {
    height: '500',
    width: '500',
    videoId: song.videoId,
    playerVars: {
      autoplay: 0,
      loop: 1,
      start: song.start
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    } 
  });
}

function onPlayerReady(event) {
  player.setPlaybackQuality("small");
  document.getElementById("player").style.display = "block";
  togglePlayButton(player.getPlayerState() !== 5);
}

function onPlayerStateChange(event) {
  if (event.data === 0) {
    togglePlayButton(false); 
  }
}

function togglePlayButton(play) {    
  document.getElementById("player-icon").className = "player-icon bi " + (play ? "bi-play-circle" : "bi-pause-circle");
}

function toggleAudio() {
  if ( player.getPlayerState() == 1 || player.getPlayerState() == 3 ) {
    player.pauseVideo(); 
    togglePlayButton(false);
  } else {
    player.playVideo(); 
    togglePlayButton(true);
  } 
}
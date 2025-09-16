console.log("Let's get Started"); 
let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all songs in the playlist
  let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songul.innerHTML = ""
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li>
        <img class="invert" src="Img/music.svg" alt="" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Error</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="Img/play.svg" alt="" />
        </div>
      </li>`;
  }

  // attach an event listener to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })
  return songs
}



const playMusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "/Img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayalbum() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];

      try {
        // get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();

        console.log(response);

        // ✅ Dynamically set data-folder value
        cardcontainer.innerHTML = cardcontainer.innerHTML + `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <img src="Img/play.svg" alt="">
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
      } catch (error) {
        console.warn(`Could not load info.json for ${folder}`, error);
      }
    }
  }

  // Load the new songs whenever a card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });
}

async function main() {
  // get the list of all songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // display albums
  displayalbum();

  // attach event listener to play/pause button
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "/Img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "/Img/play.svg";
    }
  });

  // update time and progress bar
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // seekbar click to change current time
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // close menu
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // previous/next song buttons
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // volume control
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("setting volume to ", e.target.value);
    currentsong.volume = parseInt(e.target.value) / 100;
  });

//atttach an mute button to the sound bar

document.querySelector(".volume>img").addEventListener("click", e=>{
  if(e.target.src.includes("/Img/volume.svg")){
    e.target.src = e.target.src.replace("/Img/volume.svg" ,"/Img/mute.svg")
    currentsong.volume = 0
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0
  }
  else{
    e.target.src = e.target.src.replace("/Img/mute.svg" ,"/Img/volume.svg")
    currentsong.volume = .10;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10
  }
})


}

main();

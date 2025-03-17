window.addEventListener("load", () =>{
  const bgm = document.getElementById("bgm");
  if (bgm.paused){
    let play = document.getElementById("play");
    play.onclick = () => {
      bgm.play();
      play.classList.remove("show");
    };
    play.classList.add("show");
  }
})
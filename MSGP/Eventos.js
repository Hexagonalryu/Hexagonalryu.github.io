function space_inv(){

    const msg_play = document.getElementById('arcade');
    msg_play.style.display="none";
    msg_play.style.visibility = "hidden";

    const arc_container = document.getElementById('arc_container');
    arc_container.style.display="flex";
    arc_container.style.visibility = "visible";

    const space_ifr = document.getElementById('space_ifr');
    space_ifr.setAttribute("src", "../space-invaders/index.html");



}

function cerrar_ifr(){
    const arc_container = document.getElementById('arc_container');
    arc_container.style.display="none";
    arc_container.style.visibility = "hidden";

}
fetch("teams.json").then(response => response.json()).then(data => {
    let teams = data;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const teamValue = urlParams.get("team");

    if (localStorage.getItem("name") != teams[teamValue].owner) {
        window.location.href = "..";
    }
})
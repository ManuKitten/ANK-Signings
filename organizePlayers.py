def reset(path):
    import json
    players = {}
    with open(path, "r", encoding="utf-8") as file:
        players = json.load(file)
    for player in players:
        if players[player]["rating"] < 10:
            players[player]["marketvalue"] = players[player]["rating"] * 2.5
        else:
            players[player]["marketvalue"] = 40
        players[player]["team"] = ""
    with open(path, "w", encoding="utf-8") as file:
        json.dump(players, file, indent=4)

reset("players.json")
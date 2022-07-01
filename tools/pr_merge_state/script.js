
var pulls = [];
var usefull_data = [];
var table = document.getElementById("list");
get_pulls();
setTimeout(() => {
    get_usefull_data();
    console.log(usefull_data);
    build_ui();
}, 1000);

function get_pulls() {
    var request = new XMLHttpRequest();
    request.onload = async_pulls;
    request.open('get', 'https://api.github.com/repos/letsgamedev/Suffragium/pulls', true);
    request.send();
}
function async_pulls() {
    var responseObj = JSON.parse(this.responseText);
    pulls = responseObj;
    for (i = 0; i < pulls.length; i++) {
        var request_issue = new XMLHttpRequest();
        request_issue.extraInfo = i;
        request_issue.onload = async_pull_issue;
        request_issue.open('get', pulls[i].issue_url, true);
        request_issue.send();
        var request_commits = new XMLHttpRequest();
        request_commits.extraInfo = i;
        request_commits.onload = async_pull_commits;
        request_commits.open('get', pulls[i].commits_url, true);
        request_commits.send();
    }
}
function async_pull_issue() {
    var responseObj = JSON.parse(this.responseText);
    pulls[this.extraInfo].issue_data = responseObj;
}
function async_pull_commits() {
    var responseObj = JSON.parse(this.responseText);
    pulls[this.extraInfo].commits_data = responseObj;
}

function get_usefull_data() {
    for (i = 0; i < pulls.length; i++) {
        usefull_data[i] = {};
        usefull_data[i].title = pulls[i].title;
        usefull_data[i].votes = [pulls[i].issue_data.reactions["+1"], pulls[i].issue_data.reactions["-1"]];
        usefull_data[i].last_commit = pulls[i].commits_data[pulls[i].commits_data.length - 1].commit.committer.date;
        usefull_data[i].url = pulls[i].url;
    }
}

function build_ui() {
    // console.log(document.body);
    // console.log(usefull_data);
    table = document.getElementById("list");
    // Table Header
    build_tr("title", "votes", "%", "last_commit", "https://github.com/letsgamedev/Suffragium/pulls");

    // Table Body
    for (i = 0; i < usefull_data.length; i++) {
        build_tr(
            usefull_data[i].title,
            usefull_data[i].votes,
            get_vote_percent(usefull_data[i].votes),
            get_time_passed(usefull_data[i].last_commit),
            usefull_data[i].url
        );
    }
}

function build_tr(title, votes, percent, last_commit, url) {
    var tr = document.createElement("tr");
    if (title != "title") {
        var state = check_merge_close_condition(votes, percent, last_commit)
        console.log(state)
        if (state == 1) {
            tr.classList.add("merge");
        }
        else if (state == 2) {
            tr.classList.add("close");
        }
    }

    var td_title = document.createElement("td");
    var td_votes = document.createElement("td");
    var td_percent = document.createElement("td");
    var td_last_commit = document.createElement("td");

    var a = document.createElement('a');
    // a.title = title;
    a.href = url;
    var link = document.createTextNode(title);
    a.appendChild(link);
    td_title.appendChild(a);
    td_votes.appendChild(document.createTextNode(votes));
    td_percent.appendChild(document.createTextNode(percent));
    td_last_commit.appendChild(document.createTextNode(last_commit));

    tr.appendChild(td_title);
    tr.appendChild(td_votes);
    tr.appendChild(td_percent);
    tr.appendChild(td_last_commit);
    table.appendChild(tr);
}

function get_vote_percent(votes) {
    if (votes[0] == 0) {
        return 0;
    }
    if (votes[1] == 0) {
        return 100;
    }
    var one_vote_procent = 100 / (votes[0] + votes[1]);
    return Math.ceil(100 - votes[1] * one_vote_procent);
}

function get_time_passed(last_commit) {
    // console.log(Date.parse(last_commit))
    // if (isNaN(Date.parse(last_commit))) {
    //     return last_commit
    // }
    var time_passed = Date.now() - Date.parse(last_commit);
    var days = Math.floor(time_passed / 86400000)
    var hours = Math.floor((time_passed - (days * 86400000)) / 3600000)
    var minutes = Math.floor((time_passed - (days * 86400000) - (hours * 3600000)) / 60000)
    return [days, hours, minutes]
}

function check_merge_close_condition(votes, percent, last_commit) {
    if (votes[0] >= 10 & percent >= 75 & last_commit[0] >= 1) {
        return 1
    }
    if (percent >= 75 & last_commit[0] >= 3) {
        return 1
    }
    if (last_commit[0] >= 20) {
        return 2
    }
    return 0
}

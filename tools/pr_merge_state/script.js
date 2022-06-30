
var pulls = []
var usefull_data = []
get_pulls()
setTimeout(() => {
    get_usefull_data()
    console.log(usefull_data)
}, 1000);

function get_pulls() {
    var request = new XMLHttpRequest();
    request.onload = async_pulls
    request.open('get', 'https://api.github.com/repos/letsgamedev/Suffragium/pulls', true)
    request.send()
}
function async_pulls() {
    var responseObj = JSON.parse(this.responseText);
    pulls = responseObj
    for (i = 0; i < pulls.length; i++) {
        var request_issue = new XMLHttpRequest();
        request_issue.extraInfo = i
        request_issue.onload = async_pull_issue;
        request_issue.open('get', pulls[i].issue_url, true)
        request_issue.send()
        var request_commits = new XMLHttpRequest();
        request_commits.extraInfo = i
        request_commits.onload = async_pull_commits;
        request_commits.open('get', pulls[i].commits_url, true)
        request_commits.send()
    }
}
function async_pull_issue() {
    var responseObj = JSON.parse(this.responseText);
    pulls[this.extraInfo].issue_data = responseObj
}
function async_pull_commits() {
    var responseObj = JSON.parse(this.responseText);
    pulls[this.extraInfo].commits_data = responseObj
}

function get_usefull_data() {
    for (i = 0; i < pulls.length; i++) {
        usefull_data[i] = {}
        usefull_data[i].title = pulls[i].title
        usefull_data[i].votes = [pulls[i].issue_data.reactions["+1"], pulls[i].issue_data.reactions["-1"]]
        usefull_data[i].last_commit = pulls[i].commits_data[pulls[i].commits_data.length - 1].commit.committer.date
        usefull_data[i].url = pulls[i].url
    }
}

function cb(response) {
    if (response.status) {
        setStatus('Error: 4chan API returned ' + response.status.http_code);

        setFormDisabled(false);

        return;
    }

    setStatus('Building node structure');

    var posts = response.contents.posts;

    // Nodes represent posts
    var nodes = [];

    // Edges are the connections between posts' nodes
    var edges = [];

    posts.forEach(function(post, index) {
        var mentionedPosts = [];
        var info = '';

        if (post.sub) {
            info += '<span class="subject">' + post.sub + '</span> ';
        }

        if (post.name) {
            info += '<span class="name">' + post.name + '</span> ';
        }

        if (post.trip) {
            info += '<span class="trip">' + post.trip + '</span> ';
        }

        info += '<span class="time">' + post.now + '</span> <span class="number">No.' + post.no + '</span>';

        var node = {
            id: post.no,
            label: post.no,
            shape: 'box',
            title: '<div class="info">' + info + '</div>',
            color: '#de935f'
        };

        // If post is the OP
        if (index === 0) {
            node.label += ' (OP)';
            node.color = '#cc6666';
        }

        // If the post has an image
        if (post.filename) {
            node.title += '<div class="file"><div class="file-info">File: <a href="#">' + post.filename + post.ext + '</a> (' + post.w + 'x' + post.h + ')</div><img src="http://i.4cdn.org/' + board + '/' + post.tim + 's.jpg"></div>';

            node.label += ' 📷';
        }

        // If post has text
        if (post.com) {
            node.title += '<blockquote>' + post.com + '</blockquote>';
            mentionedPosts = mentionedPostsFromText(post.com);
        }

        nodes.push(node);

        mentionedPosts.forEach(function(mentionedPost) {
            // Create an arrow from this post's node to the mentioned post's node
            edges.push({
                from: post.no,
                to: mentionedPost
            });
        });
    });

    var container = document.getElementById('content');

    var options = {
        edges: {
            arrows: {
                to: {
                    enabled: true
                }
            }
        },
        layout: {
            randomSeed: 1337
        }
    };

    var network = new vis.Network(container, {nodes: nodes, edges: edges}, options);

    // When a node is double clicked on, open the post in a new tab/window
    network.on('doubleClick', function(evt) {
        if (evt.nodes.length !== 0) {
            window.open('https://boards.4chan.org/' + board + '/thread/' + thread + '#p' + evt.nodes[0]);
        }
    });

    // Loading status
    network.on('stabilizationProgress', function(params) {
        setStatus('Stabilising: ' + Math.floor(params.iterations / params.total * 100) + '%');
    });

    network.on('stabilized', function() {
        setStatus('Idle');
    });

    setFormDisabled(false);
}

var board, thread;

var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

var setStatus = function(message) {
    document.getElementById('status').textContent = 'Status: ' + message;
};

var setFormDisabled = function(state) {
    var inputs = document.querySelectorAll('#settings input');

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = state;
    }
};

var mentionedPostsFromText = function(text) {
    return (text.match(/(&gt;){2,}[0-9]{1,13}</g) || []).map(function(match) {
        return match.substr('&gt;&gt;'.length, match.length - '&gt;&gt;<'.length);
    });
};

var load = function(board, thread) {
    setStatus('Querying 4chan API');

    var script = document.createElement('script');
    script.src = 'http://whateverorigin.org/get?url=' + encodeURIComponent('https://a.4cdn.org/' + board + '/thread/' + thread + '.json') + '&callback=cb';
    document.body.appendChild(script);
};

document.querySelector('#settings form').onsubmit = function() {
    setFormDisabled(true);

    board = document.getElementById('board').value;
    thread = document.getElementById('thread').value;

    load(board, thread);

    window.location.hash = board + '/' + thread;

    return false;
};

if (window.location.hash) {
    var segments = window.location.hash.split('/');

    board = segments[0].substring(1);
    thread = segments[1];

    load(board, thread);

    document.getElementById('board').value = board;
    document.getElementById('thread').value = thread;
}

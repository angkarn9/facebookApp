(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function() {
    FB.init({
        appId: '1936178549961973',
        cookie: true,
        xfbml: true,
        version: 'v2.9'
    });

    var finished_rendering = function() {
        checkLoginState();
    };
    FB.Event.subscribe('xfbml.render', finished_rendering);
};

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

function statusChangeCallback(response) {
    if (response.status === 'connected') {
        //Load Data
        loading();
        callAPI(function(userReactions){
            $('#result').DataTable({
                "processing": true,
                "searching": true,
                "retrieve": true,
                "paging": true,
                "data": userReactions,
                "columns": [
                    { title: "ID", data: "id" },
                    { title: "Name", data: "name" },
                    { title: "Picture", data: "picture" },
                    { title: "<img src=\"img/like.gif\" width=\"36px\"/><span>Like</span>", data: "type.like" },
                    { title: "<img src=\"img/love.gif\" width=\"36px\"/><span>Love</span>", data: "type.love" },
                    { title: "<img src=\"img/haha.gif\" width=\"36px\"/><span>Haha</span>", data: "type.haha" },
                    { title: "<img src=\"img/wow.gif\" width=\"36px\"/><span>Wow</span>", data: "type.wow" },
                    { title: "<img src=\"img/sad.gif\" width=\"36px\"/><span>Sad</span>", data: "type.sad" },
                    { title: "<img src=\"img/angry.gif\" width=\"36px\"/><span>Angry</span>", data: "type.angry" }
                ]
            });
            loadDataSuccess();
        });
    } else {
        noLogin();
    }
}

function callAPI(callBack) {
    var userReactions = [];
    FB.api('/me/feed?fields=reactions{type,name}&limit=100', function(response) {
        response.data.forEach(function(feed) {
            if (feed.reactions) {
                feed.reactions.data.forEach(function(reaction){
                    var dataObjects = userReactions.filter(function (data) {
                        return data.id === reaction.id;
                    })[0];

                    if (dataObjects) {
                        countReactionType(dataObjects, reaction.type);
                    }else{
                        // FB.api('/'+reaction.id+'/picture?type=large', function(responsePicture) {
                            var newDataObjects = {
                                id : reaction.id,
                                name : reaction.name,
                                // picture : responsePicture.data.url,
                                picture : '#',
                                type : {
                                    like : 0,
                                    love : 0,
                                    haha : 0,
                                    wow : 0,
                                    sad : 0,
                                    angry : 0
                                }
                            };                                
                            countReactionType(newDataObjects, reaction.type);
                            userReactions.push(newDataObjects);
                        // });
                    }
                });
            }
        });
        callBack(userReactions);
    });
}

function countReactionType(dataObjects, reactionType){
    switch (reactionType) {
        case "LIKE": dataObjects.type.like += 1; break;
        case "LOVE": dataObjects.type.love += 1; break;
        case "HAHA": dataObjects.type.hana += 1; break;
        case "WOW": dataObjects.type.wow += 1; break;
        case "SAD": dataObjects.type.sad += 1; break;
        case "ANGRY": dataObjects.type.angry += 1; break;
        default: dataObjects.type.like += 1; break;
    }
}

function loadDataSuccess(){
    document.getElementById("retrievingData").style.display = "none";
    document.getElementById("displayData").style.display = "block";
}

function noLogin(){
    document.getElementById("retrievingData").style.display = "none";
    document.getElementById("displayData").style.display = "none";
}

function loading(){
    document.getElementById("retrievingData").style.display = "block";
    document.getElementById("displayData").style.display = "none";
}
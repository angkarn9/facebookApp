window.fbAsyncInit = function() {
    FB.init({
        appId: '1953883458227413',
        cookie: true,
        xfbml: true,
        version: 'v2.10'
    });
    FB.AppEvents.logPageView();
    
    var finished_rendering = function() {
        checkLoginState();
    };
    FB.Event.subscribe('xfbml.render', finished_rendering);
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

function statusChangeCallback(response) {
    if (response.status === 'connected') {
        //Load Data
        loading();
        
        loadProfile();

        getReactions(function(userReactions){
            getPicUrl(userReactions, function(completeData){
                $('#result').DataTable({
                    "processing": true,
                    "searching": true,
                    "retrieve": true,
                    "paging": true,
                    "data": completeData,
                    "columns": [
                        { title: "Name", data: "name" },
                        { title: "Picture", data: "picture" },
                        { title: "<img src=\"img/like.gif\" width=\"40px\" style=\"min-width:40px\"/><span>Like</span>", data: "type.like" },
                        { title: "<img src=\"img/love.gif\" width=\"40px\" style=\"min-width:40px\"/><span>Love</span>", data: "type.love" },
                        { title: "<img src=\"img/haha.gif\" width=\"40px\" style=\"min-width:40px\"/><span>Haha</span>", data: "type.haha" },
                        { title: "<img src=\"img/wow.gif\" width=\"40px\" style=\"min-width:40px\"/><span>Wow</span>", data: "type.wow" },
                        { title: "<img src=\"img/sad.gif\" width=\"40px\" style=\"min-width:40px\"/><span>Sad</span>", data: "type.sad" },
                        { title: "<img src=\"img/angry.gif\" width=\"40px\" style=\"min-width:40px\"/><span>Angry</span>", data: "type.angry" }
                    ]
                });
                loadDataSuccess();
            });
        });
    } else {
        noLogin();
    }
}

function loadProfile(){
    //load profile image
    FB.api('/me/picture?type=large', function(response) {
        document.getElementById('profilePicture').src = response.data.url;
        document.getElementById("profileData").style.display = "block";
    });
    FB.api('/me?fields=name,id', function(response) {
        document.getElementById('profileName').innerHTML = "สวัสดีคุณ " + response.name + " ^^";
        document.getElementById('profileLink').href = "https://web.facebook.com/" + response.id;
    });
}

function getReactions(callback) {
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
                        var newDataObjects = {
                            id : reaction.id,
                            name : reaction.name,
                            picture : "#",
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
                    }
                });
            }
        });
        callback(userReactions);
    });
}

function getPicUrl(userReactions, callback){
    var completeData = [];
    var count = 0;
    userReactions.forEach(function(reaction){
        count++;
        FB.api('/'+reaction.id+'/picture?type=large', function(responsePicture) {
            reaction.picture = '<img alt=\"'+reaction.name+'\" class=\"img-thumbnail img-responsive zoom\" src=\"'+(responsePicture.data.url||"#")+'\" width=\"40%\" style="min-width:82px"/>';
            completeData.push(reaction);
            if (count===completeData.length) {
                callback(completeData);
            }
        });
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
    document.getElementById("profileData").style.display = "none";
}

function loading(){
    document.getElementById("retrievingData").style.display = "block";
    document.getElementById("displayData").style.display = "none";
}
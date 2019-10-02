var MIME_TYPE = 'text/plain';
window.URL = window.URL || window.webkitURL;

function download(element, fileName, content) {
    // revoke previous download path
    window.URL.revokeObjectURL(element.href);
    element.href = window.URL.createObjectURL(new Blob([ content ],
        { type: MIME_TYPE }));
    chrome.downloads.download({
        filename: fileName,
        url: element.href
    });
}

function getElements() {
    return {
        button: $('button.generate'),
        downloader: $('a.downloader').get(0),
        model: {
            name: $('[id="model.name"]'),
            target: $('[id="model.target"]')
        },
        target: $('#target'),
        version: $('span.version')
    };
}

function processActivePage(input) {
    return $.Deferred(function(defer) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { input: input }, defer.resolve);
        });
    }).promise();
}

function validate(element) {
    var valid = false;

    if (element) {
        var parentNode = element.parent().removeClass();

        if (element.val() === '') {
            parentNode.addClass('error');
        }
        else {
            valid = true;
        }
    }

    return valid;
}

$(document).ready(function() {
    // Standard Google Universal Analytics code
    (function(i,s,o,g,r,a,m){i.GoogleAnalyticsObject=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-325170-7', 'auto');
    // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
    ga('set', 'checkProtocolTask', null);
    ga('send', 'pageview', '/popup.html');

    var elements = getElements();
    var notify = elements.button.notify();
    var preloader = $('.preloader').preloader();
    var storage = {};

    elements.target.change(function(e) {
        e.preventDefault();
        ga('send', 'event', 'popup.target', 'change', $(this).val());
    });

    $('button.options').click(function(e) {
        e.preventDefault();
        ga('send', 'event', 'options', 'click');

        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage(function() {
                if (chrome.runtime.lastError) {
                    // fallback
                    window.open(chrome.runtime.getURL('options.html'));
                }
            });
        }
        else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });

    $('button.delete').click(function(e) {
        e.preventDefault();
        ga('send', 'event', 'options', 'click');

        chrome.storage.sync.get(["info"], function (result) {
            var todelete=[];

            for (i = 0; i < result.info.length; i++) {
                
                if($("#check" + i).is(":checked")==true){
                    todelete.push(i);
                }
                
            }

            for(i=0;i<todelete.length;i++){
                result.info.splice(i,1);
            }

            chrome.storage.sync.set({"info": result.info }, function() {
                drawControls(result);

            });

           



        });
        
       

       
    });

    $('button.add').click(function(e) {
        var target = storage.targets[elements.target.val()];
        e.preventDefault();
        ga('send', 'event', 'options', 'click');
        var name = prompt('what is the name of the element?');
        var locator = prompt('what is the locator of the element?');

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

            chrome.tabs.sendMessage(tabs[0].id, { add: { name: name, locator: locator}});
          });


    });



    $('button.findPage').click(function(e) {
        var target = storage.targets[elements.target.val()];
        e.preventDefault();
        ga('send', 'event', 'options', 'click');
        var files =[];

        function getRootTreeCallBack(sha){
            if(sha!=null){

                getFileList(sha,target.config.git.user,target.config.git.key,target.config.git.repo,getFileListCallBack);
            }
        }
        function getFileListCallBack(data,fileType){
            for(var i =0;i<data.length;++i){
                getFileContent(data[i].name,data[i].url,target.config.git.user,target.config.git.key,fileType,getFileContentCallback)
            }

        }
        function getFileContentCallback(content,type,fileName){
            //TODO
            if(type == "java"){
                commentsToJson(content,fileName);
            }else if (type == "json"){
                metaDataToJson(content,fileName);

            }
            
        }
        function metaDataToJson(content,fileName){

            var temp = JSON.parse(content);


            if(temp.metadata){
                var meta = JSON.parse(unescape(temp.metadata))
                if(meta){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

                        chrome.tabs.sendMessage(tabs[0].id, {greeting: {info:meta,name:fileName}});
                      });
                }
            }
            

        }




        

        function commentsToJson(content,fileName){
            var res = getComments(content);

            if(res != null){
                var meta = JSON.parse(unescape(res.metadata))
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

                    chrome.tabs.sendMessage(tabs[0].id, {greeting: {info:meta,name:fileName}});
                  });

            }
        }


        function getComments(text) {
            if(text == null){
                return null;
            }
            
            var index = text.indexOf(escape("PO"));
            var lastIndex = text.lastIndexOf(escape("PO"))

            if(index != -1 && lastIndex != -1){
                
                var temp = text.substring(index+4,lastIndex-3);
                return JSON.parse(temp);
            }
            return null;
            
            
        }

        getRootTree(target.config.git.branch,target.config.git.user,target.config.git.key,target.config.git.repo,getRootTreeCallBack);

    });

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if (request.greeting == "hello"){
 
            chrome.storage.sync.get(["info"], function (result) {

                drawControls(result)

            });
            

          }else if(request.greeting  == "bolo"){
            
            
            chrome.storage.sync.get(["title"], function (result) {
                var res = confirm("Current displayed page is matched with page with name = "+result.title+". Do you want to use this page");

                if(res == true){
                    elements.model.name.val(result.title);
                    chrome.storage.sync.get(["info"], function (result) {

                        drawControls(result);
                    });
                }
            });
           
            
          }
          
            
        });

    function drawControls(result){

        $(".sample").empty();

        for (i = 0; i < result.info.length; i++) {

            $(".sample").append("<li><input id='check" + i + "' type='checkbox'></input><label for='modelname" + i + "'>" + result.info[i].key + "</label><select  id='modelname" + i + "'>");

            for (var j = 0; j < result.info[i].value.length; j++) {

                $("#modelname" + i).append("<option value='" + j + "'>" + result.info[i].value[j].strict_locator + "</option>");
            }

            $(".sample").append("</select></li>");


        }

    }

    chrome.storage.sync.get(["info"], function (result) {

        drawControls(result)
    });

    elements.version.text('ver. ' + chrome.app.getDetails().version);

    common.getStorage().always(function(data) {
        storage = data;

        for (var key in storage.targets) {
            elements.target.append('<option value="' + key + '">' +
            storage.targets[key].label + '</option>');
        }


        elements.target.val(storage.target);
        elements.model.name.val(storage.model.name);
        elements.model.target.val(storage.model.target);

        // if it's still empty, let's show the reminder
        validate(elements.model.name);
    });

    
   
    elements.button.click(function (e) {

        storage.target = elements.target.val();
        storage.model.name = elements.model.name.val().replace(/\s+/g, '');
        storage.model.target = elements.model.target.val();
        storage.timestamp = new Date().valueOf();

        var finaldata = [];



        chrome.storage.sync.get(["info"], function (result) {
           


            for (let i = 0; i < result.info.length; i++) {

                var locator_temp = result.info[i].value[$("#modelname" + i).val()].strict_locator;
               
                var resulting = {

                    name: result.info[i].key,
                    class: result.info[i].value[$("#modelname" + i).val()].class, //TO-DO
                    cName: result.info[i].key.charAt(0).toUpperCase() + result.info[i].key.slice(1),


                    locator: locator_temp,
                    frameName: result.info[i].value[$("#modelname" + i).val()].frameName,
                    locator_type: result.info[i].value[$("#modelname" + i).val()].locator.type,
                    locator_value: result.info[i].value[$("#modelname" + i).val()].locator.value,



                };
                

                finaldata.push(resulting);
                

            }

            for (let i = 0; i < result.info.length; i++) {
                var tempVal = result.info[i].value[$("#modelname" + i).val()];
                result.info[i].value.splice($("#modelname" + i).val(),1);
                result.info[i].value.unshift(tempVal);
            }

            var context = {
                title: storage.model.name,
                locators: finaldata,
                metadata : escape(JSON.stringify(result.info))
            };

            var target = storage.targets[storage.target];
            
            var generated = (Handlebars.compile(target.template))(context);

            
            var fileName = storage.model.name + '.' + storage.target;

            if(target.config.git.user != ""){
            

                getFileShah(fileName, generated,target.config.git,target.config.gitcommit);
            }
            
            download(elements.downloader, fileName, generated);

            notify.success(fileName + ' is saved.');
        });
    });
});



function gitUpload(file, content, git,gitcommit, sha)
{

    // Update a user
    var url = git.repo+"/contents/";
    
    var data;

    if(sha==null){
        data = {
            "message": gitcommit.message,
            "branch":git.branch,
            "committer": {
            "name": gitcommit.user,
            "email": gitcommit.email
            },
            "content": btoa(content)
            
        };
    }else{
        data = {
            "message": gitcommit.message,
            "branch": git.branch,
            "committer": {
            "name": gitcommit.user,
            "email": gitcommit.email
            },
            "content": btoa(content),
            sha
            
        };

    }

    var json = JSON.stringify(data);

    alert(url+file)
    alert(json)
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url+file, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.setRequestHeader ("Authorization", "Basic " + btoa(git.user + ":" + git.key));

    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);   
        if (xhr.readyState == 4 && xhr.status == "200") {
            alert(JSON.stringify(users));
        } else {
            alert(JSON.stringify(xhr.responseText));
        }
    }
    xhr.send(json);
};

function getFileShah(file, content,git,gitcommit)
{

    // Update a user
    var url = git.repo+"/contents/"+file+"?ref="+git.branch;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.setRequestHeader ("Authorization", "Basic " + btoa(git.user + ":" + git.key));

    xhr.onload = function () {
        
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            alert(JSON.stringify(users))

            gitUpload(file, content, git,gitcommit,users.sha);
        } else {
            alert(JSON.stringify(users))
            gitUpload(file, content, git,gitcommit,null);
        }
    }
    xhr.send(null);
};

function getRootTree(branch, username, password, repo, cb){
    // Update a user
    var url = repo+"/branches/"+branch;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));

    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            cb(users.commit.sha)
        } else {
            cb(null);
        }
    }
    xhr.send(null);

}

function getFileList(sha, username, password,repo, cb)
{
    var fileType = getElements().target.val();
    // Update a user
    var url = repo+"/git/trees/"+sha+"?recursive=1";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));

    xhr.onload = function () {
        var content = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            var result =[];
            
            for( var index =0;index < content.tree.length; ++index){


                if(content.tree[index].type == "blob" && content.tree[index].path.endsWith(fileType)){
                    result.push({name : content.tree[index].path, url:content.tree[index].url});
                }
            }
            cb(result,fileType);
        } else {
            cb(null);
        }
    }
    xhr.send(null);
};


function getFileContent(name, url,username, password,fileType, cb){
    
    var fileName = name.substring(name.lastIndexOf('/')+1);
    fileName = fileName.substring(0,fileName.lastIndexOf('.'));



    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));

    xhr.onload = function () {
        var content = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
           
            cb(atob(content.content),fileType,fileName);
        } else {
            cb(null);
        }
    }
    xhr.send(null);

}


function getElements() {
    return {
        gitcommit: {
            user: $('[id="gitcommit.user"]'),
            email: $('[id="gitcommit.email"]'),
            message: $('[id="gitcommit.message"]')
        },
        git: {
            repo: $('[id="git.repo"]'),
            user: $('[id="git.user"]'),
            key: $('[id="git.key"]'),
            branch: $('[id="git.branch"]')
        },
        code: {
            path: $('[id="code.path"]'),
            package: $('[id="code.package"]')
            
        },
        restore: $('button.restore'),
        save: $('button.save'),
        target: $('#target'),
        template: $('#template'),
        timeout: $('#timeout')
    };
}

function loadData(elements) {
    return $.Deferred(function(defer) {
        common.getStorage().always(function(data) {
            var storage = data;

            for (var key in storage.targets) {
                elements.target.append('<option value="' + key + '">' +
                    storage.targets[key].label + '</option>');
            }

            elements.target.val(storage.target);
            elements.target.change(function(e) {
                e.preventDefault();
                var value = $(this).val();
                ga('send', 'event', 'options.target', 'change', value);
                push(elements, storage.targets[value]);
            });

            push(elements, storage.targets[storage.target]);
            defer.resolve(storage);
        });
    }).promise();
}

function pull(elements, target) {
    if (!elements || !target) {
        return;
    }

    target.config.gitcommit.user = elements.gitcommit.user.val();
    target.config.gitcommit.email = elements.gitcommit.email.val();
    target.config.gitcommit.message = elements.gitcommit.message.val();

    target.config.git.repo = elements.git.repo.val();
    target.config.git.user = elements.git.user.val();
    target.config.git.key = elements.git.key.val();
    target.config.git.branch = elements.git.branch.val();


    target.config.code.path = elements.code.path.val();
    target.config.code.package = elements.code.package.val();

    target.config.timeout = elements.timeout.val();
    target.template = elements.template.val();
}

function push(elements, target) {
    if (!elements || !target) {
        return;
    }

    elements.gitcommit.user.val(target.config.
        gitcommit.user);
    elements.gitcommit.email.val(target.config.gitcommit.email);
    elements.gitcommit.message.val(target.config.gitcommit.message);

    elements.git.repo.val(target.config.git.repo);
    elements.git.user.val(target.config.git.user);
    elements.git.key.val(target.config.git.key);
    elements.git.branch.val(target.config.git.branch);


    elements.code.path.val(target.config.code.path);
    elements.code.package.val(target.config.code.package);
    

    elements.timeout.val(target.config.timeout);
    elements.template.val(target.template);
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
    ga('send', 'pageview', '/options.html');

    var elements = getElements();
    var preloader = $('.preloader').preloader();
    var storage = {};

    elements.save.click(function(e) {
        e.preventDefault();
        ga('send', 'event', 'save', 'click');
        preloader.on();

        storage.target = elements.target.val();
        pull(elements, storage.targets[storage.target]);
        storage.timestamp = new Date().valueOf();

        chrome.storage.local.set(storage, function() {
            preloader.off();
            elements.notify.text(storage.targets[storage.target].label + ' settings saved.');

            setTimeout(function() {
                elements.notify.text('');
            }, 5000);
        });
    });

    elements.restore.click(function(e) {
        e.preventDefault();
        ga('send', 'event', 'restore', 'click');
        preloader.on();

        chrome.storage.local.clear(function() {
            elements.target.unbind('change').empty();

            // reload the data
            loadData(elements).done(function(data) {
                storage = data;
                preloader.off();
                elements.notify.text('All options are restored to their original defaults.');

                setTimeout(function() {
                    elements.notify.text('');
                }, 5000);
            });
        });
    });

    loadData(elements).done(function(data) {
        storage = data;
    });
});

/*


*/

(function( $, undefined ) {


    $.kbWidget("kbaseIrisFileBrowser", 'kbaseWidget', {
        version: "1.0.0",
        options: {
            'root' : '/',
            'controls' : true,
            'externalControls' : true,
        },

        init: function (options) {

            this._super(options);

            if (options.client) {
                this.client = options.client;
            }

            this.appendUI(this.$elem);

            return this;

        },

        refreshDirectory : function(path) {

            if (this.options.terminal.sessionId == undefined) {
                this.$elem.find('ul').first().empty();
            }

            if (this.data(path)) {
                this.listDirectory(path, this.data(path));
            }
        },

        sortByName : function (a,b) {
                 if (a['name'] < b['name']) { return -1 }
            else if (a['name'] > b['name']) { return 1  }
            else                            { return 0  }
        },

        listDirectory : function (path, $ul) {

            this.data(path, $ul);

            this.options.terminal.client.list_files_async(
                this.options.terminal.sessionId,
                '/',
                path,
                jQuery.proxy( function (filelist) {
                    var dirs = filelist[0];
                    var files = filelist[1];

                    var $fb = this;

                    $ul.empty();

                    jQuery.each(
                        dirs.sort(this.sortByName),
                        $.proxy(function (idx, val) {

                            val['full_path'] = val['full_path'].replace(/\/+/g, '/');

                            $ul.append(
                                $('<li></li>')
                                    .append(
                                        $('<a></a>')
                                            .append(
                                                $('<i></i>')
                                                    .addClass(this.data(val['full_path']) ? 'icon-folder-open-alt' : 'icon-folder-close-alt')
                                                    .css('color', 'gray')
                                            )
                                            .append(' ')
                                            .append(val['name'])
                                            .attr('href', '#')
                                            .bind('click',
                                                function(e) {
                                                    e.preventDefault();
                                                    $fb.data('activeDirectory', undefined);
                                                    $fb.data('activeFile', undefined);
                                                    $fb.viewButton().addClass('disabled');
                                                    $fb.deleteButton().addClass('disabled');

                                                    var $opened = $fb.$elem.find('.active');
                                                    $opened.removeClass('active');

                                                    //has children? It's opened. Close it.
                                                    if ($(this).next().children().length) {
                                                        //shut it if it's active. Otherwise, make it active
                                                        if ($(this).parent().get(0) == $opened.get(0)) {
                                                            $(this).children().first().removeClass('icon-folder-open-alt');
                                                            $(this).children().first().addClass('icon-folder-close-alt');
                                                            $(this).next().empty();
                                                            $fb.data(val['full_path'], undefined);
                                                        }
                                                        else {
                                                            $fb.data('activeDirectory', val['full_path']);
                                                            $(this).parent().addClass('active');
                                                            $fb.deleteButton().removeClass('disabled');
                                                        }

                                                    }
                                                    //no children? it's closed. open it.
                                                    else {
                                                        $(this).children().first().removeClass('icon-folder-close-alt');
                                                        $(this).children().first().addClass('icon-folder-open-alt');
                                                        $fb.listDirectory(val['full_path'], $(this).next());
                                                        $(this).parent().addClass('active');
                                                        $fb.data('activeDirectory', val['full_path']);
                                                        $fb.deleteButton().removeClass('disabled');
                                                    }
                                                }
                                            )
                                    )
                                    .append($('<ul></ul>').addClass('nav nav-list'))
                            );

                            if (this.data(val['full_path'])) {
                                this.listDirectory(val['full_path'], $ul.children().last().children().last());
                            }
                        }, this)
                    );
                    jQuery.each(
                        files.sort(this.sortByName),
                        function (idx, val) {

                            val['full_path'] = val['full_path'].replace(/\/+/g, '/');

                            $ul.append(
                                $('<li></li>')
                                    .append(
                                        $('<a></a>')
                                            .append(
                                                $('<i></i>')
                                                    .addClass('icon-file')
                                                    .css('color', 'gray')
                                            )
                                            .append(' ')
                                            .append(val['name'])
                                            .attr('href', '#')
                                            .bind('click',
                                                function(e) {
                                                    e.preventDefault();
                                                    $fb.data('activeDirectory', undefined);
                                                    $fb.data('activeFile', undefined);
                                                    $fb.viewButton().addClass('disabled');
                                                    $fb.deleteButton().addClass('disabled');
                                                    var $opened = $fb.$elem.find('.active');
                                                    $opened.removeClass('active');
                                                    if ($(this).parent().get(0) != $opened.get(0)) {
                                                        $(this).parent().addClass('active');
                                                        $fb.data('activeFile', val['full_path']);
                                                        $fb.viewButton().removeClass('disabled');
                                                        $fb.deleteButton().removeClass('disabled');

                                                    }
                                                    //$fb.options.terminal.open_file(val['full_path']);
                                                }
                                            )
                                    )
                            );
                        }
                    );

                    }, this
                ),
                $.proxy(function (err) {this.dbg(err)},this)
            );

        },

        appendUI : function($elem) {

            var $div = $('<div></div>')
                .css('border', '1px solid lightgray')
                .css('padding', '2px')
                .append(
                    $('<h5></h5>')
                        .addClass('text-left')
                        .text("File Browser")
                        .css('margin', '0px')
                        .css('padding', '2px')
                        .css('background-color', 'lightgray')
                        .css('border-collapse', 'collapse')
                        .bind('click',
                            function(e) {
                                $(this).next().collapse('toggle');
                            }
                        )
                    )
            ;

            var $ul = $('<ul></ul>').addClass('nav nav-list');
            var $controls =
                $('<div></div>')
                    .addClass('btn-toolbar')
                    .addClass('text-right')
                    .append(
                        $('<div></div>')
                            .addClass('btn-group')
                            .append(
                                $('<a></a>')
                                    .attr('id', 'deleteButton')
                                    .addClass('btn btn-mini disabled')
                                    .append($('<i></i>').addClass('icon-remove'))
                                    .attr('title', 'Delete selected item')
                                    .tooltip()
                                    .bind('click',
                                        $.proxy( function(e) {
                                            e.preventDefault();
                                            if (! this.deleteButton().hasClass('disabled')) {
                                                this.deleteFile();
                                            }
                                        }, this)
                                    )
                            )
                            .append(
                                $('<a></a>')
                                    .attr('id', 'viewButton')
                                    .addClass('btn btn-mini disabled')
                                    .append($('<i></i>').addClass('icon-search'))
                                    .attr('title', 'View selected file')
                                    .tooltip()
                                    .bind('click',
                                        $.proxy( function(e) {
                                            e.preventDefault();
                                            if (! this.viewButton().hasClass('disabled')) {
                                                this.options.terminal.open_file(this.data('activeFile'));
                                            }
                                        }, this)
                                    )
                            )
                            .append(
                                $('<a></a>')
                                    .attr('id', 'addDirectoryButton')
                                    .addClass('btn btn-mini')
                                    .append($('<i></i>').addClass('icon-plus'))
                                    .attr('title', 'Add new directory')
                                    .tooltip()
                                    .bind('click',
                                        $.proxy( function(e) {
                                            e.preventDefault();
                                            if (! this.addDirectoryButton().hasClass('disabled')) {
                                                this.addDirectory();
                                            }
                                        }, this)
                                    )
                            )
                            .append(
                                $('<a></a>')
                                    .attr('id', 'uploadButton')
                                    .addClass('btn btn-mini')
                                    .append($('<i></i>').addClass('icon-arrow-up'))
                                    .attr('title', 'Upload file')
                                    .tooltip()
                                    .bind('click',
                                        $.proxy( function (e) {
                                            this.data('fileInput').trigger('click');
                                        }, this)
                                    )
                            )
                            .append(
                                $('<input></input>')
                                    .attr('type', 'file')
                                    .attr('id', 'fileInput')
                                    .css('display', 'none')
                                    .bind( 'change', jQuery.proxy(this.handleFileSelect, this) )
                            )
                    )
            ;

            var $container =
                $('<div></div>')
                    .append($ul);

            $div.append($container);
            $elem.append($div);

            if (this.options.controls) {
                if (this.options.externalControls) {
                    $div.append($controls);
                }
                else {
                    $container.append($controls);
                }
            }

            this._rewireIds($div, this);

            this.listDirectory(this.options.root, $ul);

            return this;

        },

        addDirectoryButton : function() {
            return this.data('addDirectoryButton');
        },

        viewButton : function() {
            return this.data('viewButton');
        },

        deleteButton : function() {
            return this.data('deleteButton');
        },

        addDirectory : function() {
            var parentDir = this.data('activeDirectory') || '/';
            var that = this;

            var $addDirectoryModal =
                $('<div></div>')
                    .attr('class', 'modal hide fade')
                    .attr('tabindex', '-1')
                    .append(
                        $('<div></div>')
                            .attr('class', 'modal-header')
                            .append(
                                $('<button></button>')
                                    .attr('type', 'button')
                                    .attr('class', 'close')
                                    .attr('data-dismiss', 'modal')
                                    .attr('aria-hidden', 'true')
                                    .append('x\n')
                            )
                            .append(
                                $('<h3></h3>')
                                    .append('Create directory\n')
                            )
                    )
                    .append(
                        $('<div></div>')
                            .attr('class', 'modal-body')
                            .append(
                                $('<p></p>')
                                    .append('Create directory \n')
                                    .append(
                                        $('<span></span>')
                                            .css('font-weight', 'bold')
                                    )
                                    .append(' ')
                                    .append(
                                        $('<input></input>')
                                            .attr('type', 'text')
                                            .attr('name', 'dir_name')
                                            .attr('size', '20')
                                            .keypress(
                                                function(e) {
                                                    if (e.keyCode == 13) {
                                                        $(this).closest('.modal').modal('hide');
                                                        $(this).closest('.modal').find('a:last').trigger('click');
                                                        e.stopPropagation();
                                                    }
                                                }
                                            )
                                    )
                            )
                    )
                    .append(
                        $('<div></div>')
                            .attr('class', 'modal-footer')
                            .append(
                                $('<a></a>')
                                    .attr('href', '#')
                                    .attr('class', 'btn')
                                    .append('Cancel\n')
                                    .bind('click',
                                        function(e) {
                                            $(this).closest('.modal').modal('hide');
                                        }
                                    )
                            )
                            .append(
                                $('<a></a>')
                                    .attr('href', '#')
                                    .attr('class', 'btn btn-primary')
                                    .append('Create directory\n')
                                    .bind('click',
                                        function(e) {
                                            $(this).closest('.modal').modal('hide');
                                            that.options.terminal.client.make_directory_async(
                                                that.options.terminal.sessionId,
                                                parentDir,
                                                $addDirectoryModal.find('input').val(),
                                                function (res) { that.refreshDirectory(parentDir) },
                                                function() {}
                                                );
                                        }
                                    )
                            )
                    )
            ;

            $addDirectoryModal.find('span').text(parentDir);

            $addDirectoryModal.on('shown',
                function () {
                    $addDirectoryModal.find('input').focus();
                }
            );

            $addDirectoryModal.modal({'keyboard' : true});


        },

        deleteFile : function() {

            var file = this.data('activeFile');
            var deleteMethod = 'remove_files_async';

            if (file == undefined) {
                file = this.data('activeDirectory');

                if (file == undefined) {
                    return;
                }

                file = file.replace(/\/+$/, '');
                deleteMethod = 'remove_directory_async';

            }
            var matches = file.match(/(.+)\/[^/]+$/);

            var active_dir = '/';
            if (matches != undefined && matches.length > 1) {
                active_dir = matches[1];
            }

            var that = this; //sigh. The confirm button needs it for now.

            var $deleteModal =
                $('<div></div>')
                    .attr('class', 'modal hide fade')
                    .attr('tabindex', '-1')
                    .append(
                        $('<div></div>')
                            .attr('class', 'modal-header')
                            .append(
                                $('<button></button>')
                                    .attr('type', 'button')
                                    .attr('class', 'close')
                                    .attr('data-dismiss', 'modal')
                                    .attr('aria-hidden', 'true')
                                    .append('x\n')
                            )
                            .append(
                                $('<h3></h3>')
                                    .append('Confirm deletion\n')
                            )
                    )
                    .append(
                        $('<div></div>')
                            .attr('class', 'modal-body')
                            .append(
                                $('<p></p>')
                                    .append('Really delete \n')
                                    .append(
                                        $('<span></span>').css('font-weight', 'bold')
                                    )
                                    .append('?')
                            )
                    )
                    .append(
                        $('<div></div>')
                            .attr('class', 'modal-footer')
                            .append(
                                $('<a></a>')
                                    .attr('href', '#')
                                    .attr('class', 'btn')
                                    .append('Cancel\n')
                                    .bind('click',
                                        function(e) {
                                            $(this).closest('.modal').modal('hide');
                                        }
                                    )
                            )
                            .append(
                                $('<a></a>')
                                    .attr('href', '#')
                                    .attr('class', 'btn btn-primary')
                                    .append('Delete\n')
                                    .bind('click',
                                        function(e) {
                                            $(this).closest('.modal').modal('hide');
                                            that.options.terminal.client[deleteMethod](
                                                that.options.terminal.sessionId,
                                                '/',
                                                file,
                                                function (res) { that.refreshDirectory(active_dir) },
                                                function() {}
                                                );
                                        }
                                    )
                            )
                    )
            ;

            $deleteModal.unbind('keypress');
            $deleteModal.keypress(function(e) {
                if (e.keyCode == 13) {
                    $('a:last', $deleteModal).trigger("click");
                    e.stopPropagation();
                }
            });

            $deleteModal.find('span').text(file);

            $deleteModal.modal({'keyboard' : true});

        },

        handleFileSelect : function(evt) {

            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.target.files
                || evt.originalEvent.dataTransfer.files
                || evt.dataTransfer.files;

            $.each(
                files,
                jQuery.proxy(
                    function (idx, file) {

                        var reader = new FileReader();

                        var upload_dir = '/';
                        if (this.data('activeDirectory')) {
                            upload_dir = this.data('activeDirectory');
                        }


                        var $processElem;

                        if (this.options.processList) {
                            $processElem = this.options.processList.addProcess('Uploading ' + file.name);
                        }

                        reader.onload = jQuery.proxy(
                            function(e) {

                                this.options.terminal.client.put_file_async(
                                    this.options.terminal.sessionId,
                                    file.name,
                                    e.target.result,
                                    upload_dir,
                                    jQuery.proxy( function (res) {
                                        if (this.options.processList) {
                                            this.options.processList.removeProcess($processElem);
                                        }
                                        this.refreshDirectory(upload_dir)
                                    }, this),
                                    jQuery.proxy( function (res) {
                                        if (this.options.processList) {
                                            this.options.processList.removeProcess($processElem);
                                        }
                                        this.dbg(res);
                                    }, this)
                                );
                            },
                            this
                        );

                        reader.readAsText(file);

                    },
                    this
                )
            );

            this.data('fileInput').val('');

        }

    });

}( jQuery ) );
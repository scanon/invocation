/*

*/

(function( $, undefined ) {


    $.kbWidget("kbaseIrisTutorial", 'kbaseWidget', {
        version: "1.0.0",
        options: {

        },

        dispatch : {
            annotate_genome : 'http://www.prototypesite.net/iris/annotate_genome.html'
        },

        init : function (options) {
            this._super(options);

            if (this.options.tutorial != undefined) {
                this.retrieveTutorial(this.options.tutorial);
            }

            this.pages = [];
            this.currentPage = 0;

            return this;
        },

        retrieveTutorial : function(tutorial) {

            var url = this.dispatch[tutorial];

            console.log(tutorial + ' , ' + url);

            this.pages = [];

            var token = undefined;

            $.ajax(
                {
    		        async : true,
            		dataType: "text",
            		url: url,
            		crossDomain : true,
            		beforeSend: function (xhr) {
		                if (token) {
                			xhr.setRequestHeader('Authorization', token);
		                }
            		},
            		success: $.proxy(function (data, status, xhr) {
            		    var $resp = $('<div></div>').append(data);
            		    $resp = $resp.find('#tutorial');
            		    $resp.find('a').attr('target', '_blank');
            		    var children = $resp.children();
            		    this.$title = $(children[0]);
            		    this.$summary = $(children[1]);
            		    var $pages = $(children[2]);
            		    console.log(this.$title);
            		    console.log(this.$summary);

            		    this.pages.push(
            		        {
            		            title   : this.$title,
            		            content : this.$summary
            		        }
            		    );

            		    $.each(
            		        $pages.children(),
            		        $.proxy(function (idx, page) {
            		            var $head = $(page).find('h2');
            		            var $content = $(page).find('div');
            		            $(page).find('.example').remove();
            		            $.each(
            		                $(page).find('pre'),
            		                function (idx, pre) {
            		                    var html = $(pre).html();
            		                    html = html.replace(/^\s+/mg, '');
            		                    $(pre).html(html);
            		                }
            		            );
            		            $head.remove();
            		            this.pages.push(
            		                {
            		                    title   : $head,
            		                    content : $(page)
            		                }
            		            );
            		        }, this)
            		    );
            		    this.renderAsHTML();
		            }, this),
            		error: $.proxy(function(xhr, textStatus, errorThrown) {
                        throw xhr;
		            }, this),
                    type: 'GET',
    	        }
    	    );

        },

        renderAsHTML : function() {
            this.$elem.empty();
            this.$elem.append(this.$title);
            this.$elem.append(this.$summary);
            $.each(
                this.pages,
                $.proxy(function (idx, val) {
                    this.$elem.append(val.title);
                    this.$elem.append(val.content);
                }, this)
            );
        },

        lastPage : function() {
            return this.pages.length - 1;
        },

        currentPage : function() {
            return this.pages[this.currentPage];
        },

        goToPrevPage : function () {
            var page = this.currentPage - 1;
            if (page < 0) {
                page = 0;
            }
            this.currentPage = page;
            return page;
        },

        goToNextPage : function () {
            var page = this.currentPage + 1;
            if (page >= this.pages.length) {
                page = this.pages.length - 1;
            }
            this.currentPage = page;
            return page;
        },

        contentForPage : function(idx) {
            return $('<div></div>')
                .append(this.pages[this.currentPage].title)
                .append(this.pages[this.currentPage].content);
        },

        contentForCurrentPage : function () {
            return this.contentForPage(this.currentPage);
        },

    });

}( jQuery ) );

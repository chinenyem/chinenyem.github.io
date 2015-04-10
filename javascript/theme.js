"use strict";

jQuery(function($) {
	/*-----------------------------------------------------------------------------------*/
	/*	01. PARALLAX
	/*-----------------------------------------------------------------------------------*/

	$('.parallax').each(function(index, el) {
		$(el).parallax("50%", 0.6);
	});

	/*-----------------------------------------------------------------------------------*/
	/*	02. HEADER NAVIGATION
	/*-----------------------------------------------------------------------------------*/

	// Open/Close navigation

	$('.nav-toggle').on('click', function() {
		$('body').toggleClass('nav-open');
	});

	// Close navigation on clicking on a menu link

	$('.nav-menu a').on('click', function() {
		$('body').removeClass('nav-open');
	});

	// Scrolling menu change

	if( $('.nav-sticky').length ) {
		$(window).scroll(function() {
			if ($(window).scrollTop() >= 80) {
				$('body').addClass('nav-scroll-active');
			} else {
				$('body').removeClass('nav-scroll-active');
			}
		});
	}

	// Add scroll animation on anchor links

	$('.nav-menu a[href*=#]:not([href=#])').click(function() {
	  if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') 
	      || location.hostname === this.hostname) {
	    var target = $(this.hash);
	    var href = $.attr(this, 'href');
	    var mobile = 0;

	    if( $(window).width() < 992 ) {
	    	mobile = -75;
	    }
	    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	    if (target.length) {
	      $('html,body').animate({
	        scrollTop: target.offset().top + mobile
	      }, 1000, function () {
	          window.location.hash = href;
	      });
	      return false;
	    }
	  }
	});

	/*-----------------------------------------------------------------------------------*/
	/*	03. PORTFOLIO
	/*-----------------------------------------------------------------------------------*/

	
	if( $('.portfolio').length ) {
		var portfolioJSON = $('.portfolio[data-json]');
		var portfolioData = '';
		var $portfolio = $('.portfolio');

		if( portfolioJSON.length ) {
			$.ajax({
		    	url: portfolioJSON.attr('data-json'),
				cache: false,
				success: function(data) {
					portfolioData = data;

					var max = data.length,
						filter = [];

					if( max > portfolioJSON.attr('data-page') ) {
						max = portfolioJSON.attr('data-page');
					}

					// Filter

					for(var i=0; i<data.length; i++) {
						for(var j=0; j<data[i].categories.length; j++) {
							if( filter.indexOf(data[i].categories[j]) < 0 ) {
								filter.push(data[i].categories[j]);

								$('.filter ul').append($('<li><button data-filter=".' + data[i].categories[j].toLowerCase().replace(/\s/g, '-') + '">' + data[i].categories[j] + '</button></li>'));
							}
						}
					}

					// New elements

					for(var i=0; i<max; i++) {
						portfolioJSON.append(portfolioItem(data[i]));
					}

					if( max === portfolioData.length ) {
						$('.portfolio-more button').attr('disabled', true);
					}

					portfolioInit();
				}
			});
	    }

	    $('.portfolio-more button').on('click', function() {
			var max   = parseInt(portfolioJSON.attr('data-page'));
			var cur   = parseInt(portfolioJSON.find('.portfolio-item').length);

			if( max + cur >= portfolioData.length ) {
				max = portfolioData.length;
				$(this).attr('disabled', true);
			} else {
				max += cur;
			}

	    	for(var i=cur; i<max; i++) {
				$portfolio.isotope( 'insert', portfolioItem(portfolioData[i]) );
	    	}

	    	 $('.portfolio').imagesLoaded( function() {
	    	 	$portfolio.isotope('layout');
	    	 });
	    });

	    if( ! portfolioJSON.length ) {
			portfolioInit();
	    }

	    
	}

	function portfolioItem(data) {
		// Item classes
		var itemClass = 'portfolio-item';

		if( data.large ) {
			itemClass += ' portfolio-large';
		}

		for(var j=0;j<data.categories.length;j++) {
			itemClass += ' ' + data.categories[j].toLowerCase().replace(/\s/g, '-');
		}

		// Create all the parts
		var item = $('<article>', { 'class': itemClass })
			.append($('<a>',      { 'href': data.url }).on('click', function(e) {
				portfolioAJAX( $(this), e );
			}).append($('<img>',    { 'src': data.image, 'alt': data.name }))
			.append($('<div>',    { 'class': 'hover' })
			.append($('<div>',    { 'class': 'hover-content' })
			.append($('<h5>',     { 'html': data.name }))
			.append($('<span>',   { 'html': data.categories.join(' / ') }))))
		);

		return item;
	}

	function portfolioAJAX(org, e, external) {
		if( !org.hasClass('porftolio-post-close') ) {
			unLoadSite(100);
		}
		
		$.ajax({
		  url: org.attr('href'),
		  cache: false,
		  success: function(html) {
		    $('body').append('<div class="portfolio-content">' + html + '</div>');

			$('.porftolio-post-close').on('click', function() {
				$('body').removeClass('portfolio-ajax-active');
			});

			$('.porftolio-post-prev, .portfolio-nav .prev').on('click', function(e) {
				if( external ) {
					$('.portfolio-item:last-of-type').find('a').click();
				} else {
					org.parent().prev().find('a').click();
				}

				e.preventDefault();
				return false;
			});

			$('.porftolio-post-next, .portfolio-nav .next').on('click', function(e) {
				if( external ) {
					$('.portfolio-item:first-of-type').find('a').click();
				} else {
					org.parent().next().find('a').click();
				}

				e.preventDefault();
				return false;
			});

		    $('portfolio-content').imagesLoaded(function() {
				$('body').addClass('portfolio-ajax-active');
				
				loadSite(500);

				waypointsAnimations('.portfolio-content', 'bottom-in-view');
		    });
		    
		  }
		});

		e.preventDefault(); 
		return false;
	}

    function portfolioInit() {
		var layoutMode = 'masonry';
		if( $('.portfolio-4-columns').length ) {
			layoutMode = 'fitRows';
		}
		var $portfolio = $('.portfolio').imagesLoaded( function() {
			$portfolio.isotope({
				itemSelector: '.portfolio-item',
				layoutMode: layoutMode
			}).isotope('layout');
		});

		$('.filter').on( 'click', 'button', function() {
			var filterValue = $(this).attr('data-filter');
			$portfolio.isotope({ filter: filterValue });

			$('.filter .selected').removeClass('selected');
			$(this).addClass('selected');
		});

		if( $('.portfolio-ajax').length ) {
			$('.portfolio-ajax a').on('click', function(e) {
				portfolioAJAX( $(this), e );
			});
		}
	}


	/*-----------------------------------------------------------------------------------*/
	/*	04. VIDEOS (for background video, either from YouTube or using the video element)
	/*-----------------------------------------------------------------------------------*/

	$(".player").mb_YTPlayer();

	$(".video video").prop("volume", 0);

	/*-----------------------------------------------------------------------------------*/
	/*	05. SLICK CAROUSEL (testimonials, projects)
	/*-----------------------------------------------------------------------------------*/

	$('.projects').slick();
	$('.testimonials').slick({
		dots: true,
		fade: true,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 5000
	});

	/*-----------------------------------------------------------------------------------*/
	/*	06. INSTAGRAM
	/*-----------------------------------------------------------------------------------*/

	$('.instagram').on('didLoadInstagram', function(event, response) {
		var instagram = {};
		var $url = 'https://api.instagram.com/v1/users/22390893/?access_token=1554589859.71ed503.20f8b92a2d31453a97db5384e33ce3f9';

		$.ajax({
			method : "GET",
			url : $url,
			dataType : "jsonp",
			jsonp : "callback",
			success : function(dataSuccess) {
				instagram.authorPhoto = dataSuccess.data.profile_picture;
				instagram.followers = dataSuccess.data.counts.followed_by;
				instagram.photos = dataSuccess.data.counts.media;
				instagram.username = dataSuccess.data.username;
				instagram.full_name = dataSuccess.data.full_name;

				var data = response.data;
				var tagNames = [];
				var tagNums = [];
				var tags = [];
				instagram.target = event.currentTarget.id;
				instagram.likes = 0;

				for(var i=0; i<data.length; i++) {
					instagram.likes += data[i].likes.count;

					/* Get tag names and how many are there */
					for(var j=0; j<data[i].tags.length; j++) {
						if(tagNames.indexOf(data[i].tags[j]) === -1) {
							tagNames.push(data[i].tags[j]);
							tagNums.push(1);
						} else {
							tagNums[tagNames.indexOf(data[i].tags[j])]++;
						}
					}
				};

				/* Sort tags array */
				for (var i = 0; i < tagNames.length; i++) { tags.push({ 'name': tagNames[i], 'value': tagNums[i] }); }
				tags.sort(function(a, b) { return b.value - a.value; });

				/* Add instagram photos */

				for(var i=0; i<12; i++) {
					$("#" + instagram.target + ' .instagram-images').append('<li style="background-image: url(' + data[i].images.low_resolution.url + ')"></li>');
				}

				/* Add Instagram User Information */
				$("#" + instagram.target + ' .instagram-author-photo').append('<img src="' + instagram.authorPhoto + '" alt="' + instagram.full_name + '" />');
				for(var i=0; i<0; i++) {
					$("#" + instagram.target + ' .instagram-tags').append('<a href="http://www.enjoygram.com/tag/' + tags[i].name + '" target="_blank">#' + tags[i].name + '</a> ');
				}
				$("#" + instagram.target + ' .instagram-author-tag').append('<a href="http://instagram.com/' + instagram.username + '" target="_blank">#' + instagram.username + '</a>');
				$("#" + instagram.target + ' .num-photos span').html(instagram.photos);
				$("#" + instagram.target + ' .num-followers span').html(instagram.followers);
				$("#" + instagram.target + ' .num-likes span').html(instagram.likes);
				$("#" + instagram.target + ' .instagram-follow').attr('href', 'http://instagram.com/' + instagram.username);
			}
		});
	});

/*-----------------------------------------------------------------------------------*/
	/*	06. Wordpress
	/*-----------------------------------------------------------------------------------*/

	jQuery(function($) {
    $.getJSON('http://public-api.wordpress.com/rest/v1/sites/chinenyemnwadiugwu.wordpress.com/posts/?number=3order=DESC&callback=?')
        .success(function(response) {

        	//content
            var $content = "",
                 it = response.posts[0].content,
                 hcontentone = response.posts[1].content,
                 hfcontenttwo = response.posts[2].content;

	             console.log(hcontentone, hfcontenttwo, $content );
	             console.log( "this" + it);

	             $("#articleone").click(function(){
	             	event.preventDefault();

                    console.log(it);

                     

                    $("#articleone").replaceWith('<article>' + '<div class="container two">' + '<div class="row">' + 
	             	               '<div class ="col-md-12">' + '<p class="blogone">' +  '</p>' + '</div>' + '</div>' +
	             	               '</div>' +  '</article>');

                   var hideBlog = $(".blogone").hide();
                   var blog = $(".blogone").html(it);
                   var blogText = blog.text();

                   if(blogText.length > 100){
                   	blogText = blogText.substring(0,500);
                   	$(".blogone").text(blogText + "..." );
                   	
                   	$("<a id='hrefone' href='#'>" + "READ MORE" + "</a>").appendTo(".two");

                   	$(".blogone").css({"color": "black", "font-weight": "bold", "font-size": "21px"});
                     $("a #imgx").css({"margin-left": "95%", "position": "absolute", "margin-top": "-3%", "height" : "22px"});
                   } 

                   
                       hideBlog.fadeIn(900);

                       $("#hrefone")
                                 .attr('href', response.posts[0].URL);
  
	             });


                 
                 $("#articletwo").click(function(){
	             	event.preventDefault();

                    console.log(hcontentone);

                     

                    $("#articletwo").replaceWith('<article>' + '<div class="container three">' + '<div class="row">' + 
	             	               '<div class ="col-md-12">' + '<p class="blogtwo">' +  '</p>' + '</div>' + '</div>' +
	             	               '</div>' +  '</article>');

                   var hideBlog = $(".blogtwo").hide();
                   var blog = $(".blogtwo").html(hcontentone);
                   var blogText = blog.text();

                   if(blogText.length > 100){
                   	blogText = blogText.substring(0,500);
                   	$(".blogtwo").text(blogText + "..." );
                   	
                   	$("<a id='hreftwo' href='#'>" + "READ MORE" + "</a>").appendTo(".three");

                   	$(".blogtwo").css({"color": "black", "font-weight": "bold", "font-size": "21px"});
                     $("a #imgx").css({"margin-left": "95%", "position": "absolute", "margin-top": "-3%", "height" : "22px"});
                   } 

                   
                        hideBlog.fadeIn(900);

                       $("#hreftwo")
                                 .attr('href', response.posts[1].URL);
  
	             });

                $("#articlethree").click(function(){
	             	event.preventDefault();

                    console.log(hfcontenttwo);

                     

                    $("#articlethree").replaceWith('<article>' + '<div class="container four">' + '<div class="row">' + 
	             	               '<div class ="col-md-12">' + '<p class="blogthree">' +  '</p>' + '</div>' + '</div>' +
	             	               '</div>' +  '</article>');

                   var hideBlog = $(".blogthree").hide();
                   var blog = $(".blogthree").html(hfcontenttwo);
                   var blogText = blog.text();

                   if(blogText.length > 100){
                   	blogText = blogText.substring(0,500);
                   	$(".blogthree").text(blogText + "..." );
                   	
                   	$("<a id='hrefthree' href='#'>" + "READ MORE" + "</a>").appendTo(".four");

                   	$(".blogthree").css({"color": "black", "font-weight": "bold", "font-size": "21px"});
                     $("a #imgx").css({"margin-left": "95%", "position": "absolute", "margin-top": "-3%", "height" : "22px"});
                   } 

                   
                        hideBlog.fadeIn(900);

                       $("#hrefthree")
                                 .attr('href', response.posts[2].URL);
  
	             });
                        
                     

                      


        

           //date info 
            var dateStr = response.posts[0].date,
                dateStrone = response.posts[1].date,
                dateStrtwo = response.posts[2].date;

            console.log(dateStr);
            
             var date = new Date(dateStr),
                dateO = new Date(dateStrone),
                dateT = new Date(dateStrtwo);

            console.log(date);
            
               var day = date.getDay(),
                dayOne = dateO.getDay(),
                dayTwo = dateT.getDay(),

                month = date.getMonth(),
                monthOne = dateO.getMonth(),
                monthTwo = dateT.getMonth(),

                year = date.getFullYear(),
                yearOne = dateO.getFullYear(),
                yearTwo = dateT.getFullYear(),
            
                monthNames = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
               ],
            
                monthWord = monthNames[month],
                monthWordOne =monthNames[monthOne], 
                monthWordTwo = monthNames[monthTwo];
            
               var fullDate = monthWord  + " " + day + "," + " " + " " + year,
                fullDateOne = monthWordOne + " " + dayOne + "," + " " + yearOne,
                fullDateTwo = monthWordTwo + " " + dayTwo + "," + " " + yearTwo;
            
            $("#dateone").text(fullDate);
            $("#datetwo").text(fullDateOne);
            $("#datethree").text(fullDateTwo);


            //author info

            var author = response.posts[0].author.name,
                authorone = response.posts[1].author.name,
                authortwo = response.posts[2].author.name;
             
            var capitalizeMe = author,
                capitalizeMeOne = authorone,
                capitalizeMeTwo	 = authortwo;
            
            var authorCap = capitalizeMe.charAt(0).toUpperCase() + capitalizeMe.substring(1),
                authorCapOne = capitalizeMeOne.charAt(0).toUpperCase() + capitalizeMeOne.substring(1),
 				authorCapTwo = capitalizeMeTwo.charAt(0).toUpperCase() + capitalizeMeTwo.substring(1);
            
            $("#authorone").text(authorCap);
            $("#authortwo").text(authorCapOne);
            $("#authorthree").text(authorCapTwo);

            //title

             $('#titleone')
                .html(response.posts[0].title);
             $("#titletwo")
                .html(response.posts[1].title);
             $("#titlethree")
                .html(response.posts[2].title); 

             $("#hrefone")
                .attr('href', response.posts[0].URL);
               $("#hreftwo")
                 .attr('href', response.posts[1].URL);
              $("#hrefthree")
                   .attr('href', response.posts[2].URL);
        });

     
});





    /*-----------------------------------------------------------------------------------*/
	/*	Mandrill
	/*-----------------------------------------------------------------------------------*/

	jQuery(function($)  
{
    $("#contact_form").submit(function()
    {
        var email = $("#email").val(); // get email field value
        var name = $("#name").val(); // get name field value
        var msg = $("#msg").val(); // get message field value
        $.ajax(
        {
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'UJ0ljYkwVEc6rLXqwShHTg',
                'message': {
                    'from_email': email,
                    'from_name': name,
                    'headers': {
                        'Reply-To': email
                    },
                    'subject': 'Chinenyem Agency Contact Form Submission',
                    'text': msg,
                    'to': [
                    {
                        'email': 'chnw1947@gmail.com',
                        'name': 'Chinenyem N',
                        'type': 'to'
                    }]
                }
            }
        })
        .done(function(response) {
            alert('Your message has been sent. Thank you!'); // show success message
            $("#name").val(''); // reset field after successful submission
            $("#email").val(''); // reset field after successful submission
            $("#msg").val(''); // reset field after successful submission
        })
        .fail(function(response) {
            alert('Error sending message.');
        });
        return false; // prevent page refresh
    });
});




	/*-----------------------------------------------------------------------------------*/
	/*	07. BLOG MASONRY
	/*-----------------------------------------------------------------------------------*/

	if( $('.blog-masonry').length ) {
		var $portfolio = $('.blog-masonry').imagesLoaded( function() {
			$portfolio.isotope({
				itemSelector: '.blog-masonry > div',
				layoutMode: 'masonry'
			});
		});
	}

	/*-----------------------------------------------------------------------------------*/
	/*	08. Preloader
	/*-----------------------------------------------------------------------------------*/

	$('.site').imagesLoaded( function() {
		loadSite();
	});

	setTimeout(loadSite, 10000);

	function loadSite() {
		$('body').addClass('site-loaded');
		$('.preloader').fadeOut(1000);
	}

	/*-----------------------------------------------------------------------------------*/
	/*	09. FORMS
	/*-----------------------------------------------------------------------------------*/

	var formElement = $('form[data-form="contact-form"]');

	if( formElement.length ) {
		formElement.validate({
			 submitHandler: function(form) {
			 	$('#contact-form-message').remove();
			 	
		        try {
					$.ajax({
						type: 'POST',
						url: 'http://zmthemes.com/dropout-html/php/mail.php',
						data: {
							form : formElement.serialize(),
						}
					}).success(function(msg) {
						formElement.append('<label id="contact-form-message" class="success">' + msg + '</label>');
					});
		        } catch(e) { console.log(e); }

				return false;
			 }
		});
	}

	$('form[data-form="submit"] input').keypress(function (e) {		
		if (e.which == 13) {
			$(this).parent().submit();
			e.preventDefault(); 
			return false;
		}
	});

	function waypointsAnimations(context, offset) {
		if( $('.animate').length ) {
			$('.animate').waypoint({
			  handler: function() {
			    var el = $(this.element);
			    if( ! el.hasClass('animated') ) {
				    el.addClass('animated');

					if( el.hasClass('counter') ) {
						el.find('span').each(function () {
						    $(this).prop('Counter',0).animate({
						        Counter: $(this).attr('data-val')
						    }, {
						        duration: 3000,
						        easing: 'swing',
						        step: function (now) {
						            $(this).text(Math.ceil(now));
						        }
						    });
						});
					}
				}
			  },
			  offset: offset,
			  context: context
			});
		}
	}
	waypointsAnimations(window, 'bottom-in-view');

	/*-----------------------------------------------------------------------------------*/
	/*	10. IE9 Placeholders
	/*-----------------------------------------------------------------------------------*/
	$.support.placeholder = ('placeholder' in document.createElement('input'))
	if (!$.support.placeholder) {
		$("[placeholder]").focus(function () {
			if ($(this).val() == $(this).attr("placeholder")) $(this).val("");
		}).blur(function () {
			if ($(this).val() == "") $(this).val($(this).attr("placeholder"));
		}).blur();

		$("[placeholder]").parents("form").submit(function () {
			$(this).find('[placeholder]').each(function() {
				if ($(this).val() == $(this).attr("placeholder")) {
					$(this).val("");
				}
			});
		});
	}
});

/*-----------------------------------------------------------------------------------*/
/*	11. GOOGLE MAPS
/*-----------------------------------------------------------------------------------*/

function map(element, location, zoom) {
	jQuery(element).gmap3({
		map: {
			options: {
				zoom: zoom,
				scrollwheel: false
			}
		},
		getlatlng:{
			address: location,
			callback: function(results) {
			if ( !results ) { return; }
			jQuery(this).gmap3('get').setCenter(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
			jQuery(this).gmap3({
				marker: {
					latLng:results[0].geometry.location,
				}
			});
			}
		}
	});
}
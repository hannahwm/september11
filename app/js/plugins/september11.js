var $ = jQuery;

( function( $ ) {
  var Neu = Neu || {};

  $.fn.scrollmagicControls = function(options) {
      return this.each(function() {
          var scrollmagicControls = Object.create(Neu.scrollmagicControls);
          scrollmagicControls.init(this, options);
      });
  };

  $.fn.scrollmagicControls.options = {
      pinned: ".pinned-content",
      background: ".background",
      video: ".background-video",
      videoElm: "#video-source",
      audioButton: ".audio-button",
      backgroundAudioPlayer: "#background-audio-player",
      backgroundAudio: "#background-audio",
      foregroundAudioPlayer: "#foreground-audio-player",
      foregroundAudio: "#foreground-audio"
  };

  Neu.scrollmagicControls = {
      init: function(elem, options) {
          var self = this;

          //aspect ratios (videos are 1.77777777778 or 16:9)
          self.VIDEO_ASPECT = 1.77777777778;
          var NARROW = 0.56;
          var WIDE = 1.7;
          var EXTRA_WIDE;

          self.$container = $(elem);
          self.options = $.extend({}, $.fn.scrollmagicControls.options, options);
          self.bindElements();
          self.bindEvents();

          $(document).ready( function() {
              self.triggerScrollMagic();
              self.checkAspectRatio();

              //detect browser height and width and set video to fill out as much space as it can. Also center video
          });
      },
      bindElements: function() {
        var self = this;

        self.$audioIsPlaying = false;
        self.$pinned = self.$container.find(self.options.pinned);
        self.$videoElm = self.$container.find(self.options.videoElm);
        self.$background = self.$container.find(self.options.background);
        self.$audioButton = self.$container.find(self.options.audioButton);
        self.$backgroundAudioPlayer = self.$container.find(self.options.backgroundAudioPlayer);
        self.$foregroundAudioPlayer = self.$container.find(self.options.foregroundAudioPlayer);
        self.controller = new ScrollMagic.Controller();
        // {addIndicators: true}
    },
    bindEvents: function() {
      var self = this;
      var backgroundAudio = $(self.options.backgroundAudio).get(0);

      $(window).resize( function() {
        self.checkAspectRatio();
      });

      $(document).ready( function() {
        self.checkAspectRatio();
      });

      if (backgroundAudio) {
        backgroundAudio.onplaying = function() {
          self.$audioIsPlaying = true;
        };

        backgroundAudio.onpause = function() {
          self.$audioIsPlaying = false;
        };
      }

      $(self.options.audioButton).on("click tap", function() {
        $(self.options.audioButton).toggleClass("muted");
        self.togglePlay();
      });
    },
    togglePlay: function() {
      var self = this;
      var backgroundAudio = $(self.options.backgroundAudio).get(0);

      self.$audioIsPlaying ? backgroundAudio.pause() : backgroundAudio.play();

    },
    checkAspectRatio: function() {
      var self = this;

      function gcd (a, b) {
        return (b == 0) ? a: gcd (b, a%b);
      }

      var winWidth = $(window).width();
      var halfWindowWidth = winWidth / 2;
      var winHeight = $(window).height();
      var greatestCommonDivisor = gcd(winWidth, winHeight);
      var windowAspect = (winWidth/greatestCommonDivisor) / (winHeight/greatestCommonDivisor);

      if (windowAspect > self.VIDEO_ASPECT) {
        $(self.options.video).css({
          "width" : winWidth,
          "height": "auto",
          "left": leftPos
        })
      } else {
        $(self.options.video).css({
          "width": "auto",
          "height": winHeight,
          "left": leftPos
        })
      }

      var halfVideoWidth = $(self.options.video).width() / 2;
      var leftPos = halfWindowWidth - halfVideoWidth;
      $(self.options.video).css("left", leftPos);
    },
    triggerScrollMagic: function() {
      var self = this;

      for (var i=0; i<self.$pinned.length; i++) {
  			var slide = self.$pinned[i];
        var duration;

        duration = $(window).height() + 100;

  			new ScrollMagic.Scene({
					triggerElement: slide,
					duration: duration,
					triggerHook: 0.7,
					reverse: true
				})
        .on("enter leave", function(e) {

          //the trigger is ".pinned-content"
          var trigger = this.triggerElement();
          var triggerID = $(trigger).attr("id");
          var videoData = $(trigger).attr("data-video");
          var videoUrl = "/interactive/2021/09/september11/video/" + videoData;
          var audioBgData = $(trigger).attr("data-bg-audio");
          var audioBgUrl = "/interactive/2021/09/september11/audio/" + audioBgData;
          var audioFgData = $(trigger).attr("data-fg-audio");
          var audioFgUrl = "/interactive/2021/09/september11/audio/" + audioFgData;
          var photoData = $(trigger).attr("data-photo");
          var photoUrl = "url('/interactive/2021/09/september11/images/" + photoData + "')";

          $(trigger).toggleClass("active");

          if (e.type === "enter") {
            $(self.options.videoElm).attr("src", videoUrl);
            var autoplayVideo = $(self.options.video).get(0);
            var foregroundVideo = $(trigger).find(".foreground-video").get(0);
            var foregroundAudioPlayer = $(trigger).find(self.options.foregroundAudioPlayer);


            setTimeout(function() {

              $(self.options.background).css({
                "-webkit-transition": "opacity 0.5s ease-in-out",
                "-moz-transition": "opacity 0.5s ease-in-out",
                "-ms-transition": "opacity 0.5s ease-in-out",
                "-o-transition": "opacity 0.5s ease-in-out",
                "transition": "opacity 0.5s ease-in-out",
                "opacity": "1"
              });

              if (photoData) {
                $(self.options.background).css("background-image", photoUrl);
                $(autoplayVideo).css("opacity", 0);
              } else {
                $(self.options.background).css("background-image", "");

              }

              if (videoData) {
                $(autoplayVideo).css("opacity", 1);
                autoplayVideo.load();
                autoplayVideo.play();
              }

              if (foregroundVideo) {
                $(foregroundVideo).css("opacity", 1);
                setTimeout( function() {
                  foregroundVideo.play();
                }, 1000);
              }

              if (foregroundAudioPlayer.length) {
                setTimeout( function() {
                  self.triggerAudioBars(audioFgUrl);
                }, 1000);
              }

              if (audioBgData) {
                //play audio unless mute button has been clicked
                if ( !($(self.options.audioButton).hasClass("muted")) ) {
                  var newBgAudio = document.createElement('audio');
                  newBgAudio.id = "background-audio";
                  newBgAudio.src = audioBgUrl;
                  newBgAudio.play();
                  newBgAudio.loop = true;
                  $(self.options.backgroundAudioPlayer).append(newBgAudio);
                }
                $(self.options.audioButton).fadeIn();
              } else {
                $(self.options.audioButton).fadeOut();
              }
            }, 500);


          } else {
            var backgroundAudio = $(self.options.backgroundAudio).get(0);
            var foregroundVideo = $(trigger).find(".foreground-video").get(0);
            var foregroundAudio = $(self.options.foregroundAudio).get(0);
            var autoplayVideo = $(self.options.video).get(0);

            $(self.options.background).css({
              "-webkit-transition": "opacity 0.5s ease-in-out",
              "-moz-transition": "opacity 0.5s ease-in-out",
              "-ms-transition": "opacity 0.5s ease-in-out",
              "-o-transition": "opacity 0.5s ease-in-out",
              "transition": "opacity 0.5s ease-in-out",
              "opacity": "0"
            });

            if (videoData) {
              autoplayVideo.pause();
            }

            if (backgroundAudio) {
              $(self.options.backgroundAudio).remove();
            }

            if (foregroundVideo) {
              foregroundVideo.pause();

              setTimeout( function() {
                $(foregroundVideo).css("opacity", 0);
              }, 1000);
            }

            if (foregroundAudio) {
              foregroundAudio.pause();
            }
          }
        })
				.addTo(self.controller);
  		}
    },
    triggerAudioBars: function(url) {
      var self = this;
      var foregroundAudio = document.getElementById("foreground-audio");;
      foregroundAudio.src = url;
      foregroundAudio.load();
      foregroundAudio.play();
      var context = new AudioContext();
      var src = context.createMediaElementSource(foregroundAudio);
      var analyser = context.createAnalyser();

      var canvas = document.getElementById("canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var ctx = canvas.getContext("2d");

      src.connect(analyser);
      analyser.connect(context.destination);

      analyser.fftSize = 256;

      var bufferLength = analyser.frequencyBinCount * 0.8;
      console.log(bufferLength);

      var dataArray = new Uint8Array(bufferLength);

      var WIDTH = canvas.width;
      var HEIGHT = canvas.height;

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      function renderFrame() {
        requestAnimationFrame(renderFrame);

        x = 0;

        analyser.getByteFrequencyData(dataArray);

        // ctx.fillStyle = "#000";
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          var r = barHeight + (25 * (i/bufferLength));
          var g = 250 * (i/bufferLength);
          var b = 100;

          ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      }

      foregroundAudio.play();
      renderFrame();
    }
  };

}( $ ) );

(function init () {
  $(document).ready(function() {
    $(".wrapper").scrollmagicControls();
  });
})();

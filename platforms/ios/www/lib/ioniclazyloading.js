angular.module('ionicLazyLoadCache', []);

angular.module('ionicLazyLoadCache')

.directive('lazyScroll', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                var origEvent = $scope.$onScroll;
                $scope.$onScroll = function () {
                    $rootScope.$broadcast('lazyScrollEvent');
                    if(typeof origEvent === 'function'){
                      origEvent();
                    }
                };
            }
        };
}])
.directive('imageLazyCached', ['$document', '$timeout', '$ionicScrollDelegate', '$compile',
    function ($document, $timeout, $ionicScrollDelegate, $compile) {
        return {
            restrict: 'E',
            template: '<img></img>',
            replace: true,
            scope: {
                lazyScrollResize: "@lazyScrollResize",
                imageLazySrc: "@imageLazySrc"
            },
            link: function ($scope, $element, $attributes) {
                if (!$attributes.imageLazyDistanceFromBottomToLoad) {
                    $attributes.imageLazyDistanceFromBottomToLoad = 0;
                }
                if (!$attributes.imageLazyDistanceFromRightToLoad) {
                    $attributes.imageLazyDistanceFromRightToLoad = 0;
                }

                var loader;
                if ($attributes.imageLazyLoader) {
                    loader = $compile('<div class="image-loader-container"><ion-spinner class="image-loader" icon="' + $attributes.imageLazyLoader + '"></ion-spinner></div>')($scope);
                    $element.after(loader);
                }

                $scope.$watch('imageLazySrc', function (oldV, newV) {
                    if(loader)
                        loader.remove();
                    if ($attributes.imageLazyLoader) {
                        loader = $compile('<div class="image-loader-container"><ion-spinner class="image-loader" icon="' + $attributes.imageLazyLoader + '"></ion-spinner></div>')($scope);
                        $element.after(loader);
                    }
                    var deregistration = $scope.$on('lazyScrollEvent', function () {
                        //    console.log('scroll');
                            if (isInView()) {
                                loadImage();
                                deregistration();
                            }
                        }
                    );
                    $timeout(function () {
                        if (isInView()) {
                            loadImage();
                            deregistration();
                        }
                    }, 500);
                });
                var deregistration = $scope.$on('lazyScrollEvent', function () {
                       // console.log('scroll');
                        if (isInView()) {
                            loadImage();
                            deregistration();
                        }
                    }
                );

                function loadImage() {
                    //Bind "load" event
                    $element.bind("load", function (e) {
                        if ($attributes.imageLazyLoader) {
                            loader.remove();
                        }
                        if ($scope.lazyScrollResize == "true") {
                            //Call the resize to recalculate the size of the screen
                            $ionicScrollDelegate.resize();
                        }
                        $element.unbind("load");
                    });
                    //load from cache
                    loadFromCache();
                }
                function loadFromCache() {
                    if (ImgCache.ready) {
                        ImgCache.cacheFile($scope.imageLazySrc, function() {
                            ImgCache.getCachedFileURL($scope.imageLazySrc, function(src, tar){
                                $element[0].src = tar;
                            })
                        }, function() {
                            console.error('Could not download image (ImgCache).');
                            loader.remove();
                        });
                    } else {
                        $element[0].src = $scope.imageLazySrc;
                    }
                }
                function isInView() {
                    var clientHeight = $document[0].documentElement.clientHeight;
                    var clientWidth = $document[0].documentElement.clientWidth;
                    var imageRect = $element[0].getBoundingClientRect();
                    return (imageRect.top >= 0 && imageRect.top <= clientHeight + parseInt($attributes.imageLazyDistanceFromBottomToLoad))
                        && (imageRect.left >= 0 && imageRect.left <= clientWidth + parseInt($attributes.imageLazyDistanceFromRightToLoad));
                }

                // bind listener
                // listenerRemover = scrollAndResizeListener.bindListener(isInView);

                // unbind event listeners if element was destroyed
                // it happens when you change view, etc
                $element.on('$destroy', function () {
                    deregistration();
                });

                // explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)
                $timeout(function () {
                    if (isInView()) {
                        loadImage();
                        deregistration();
                    }
                }, 500);
            }
        };
    }]);
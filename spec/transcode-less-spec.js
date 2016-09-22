describe('TranscodeLess', function () {
    it('Simple file trancoding', function () {
        Transcoder.transcodeFile("./files/simple.less")
            .then(function (filepath) {
            alert(filepath);
        });
    });
});

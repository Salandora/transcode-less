

describe('TranscodeLess', () => {
  it('Simple file trancoding', () => {
    Transcoder.transcodeFile("./files/simple.less")
      .then(filepath => {
        alert(filepath);
      });
  });
});

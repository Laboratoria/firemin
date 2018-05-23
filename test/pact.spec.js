const pact = require('../lib/pact');


describe('pact', () => {

  it('should be a function', () => {
    expect(typeof pact).toBe('function');
  });

  it('should process tasks', (done) => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
      () => Promise.resolve(4),
      () => Promise.resolve(5),
    ];
    pact(tasks, 2).then((stats) => {
      expect(stats).toMatchSnapshot();
      done();
    });
  });

  it('should bail out on error in failFast mode', (done) => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.reject('error!'),
      () => Promise.resolve(4),
      () => Promise.resolve(5),
    ];
    pact(tasks, 2).catch((err) => {
      expect(err).toBe('error!');
      done();
    });
  });

  it('should handle error when failFast is false', (done) => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.reject('error!'),
      () => Promise.resolve(4),
      () => Promise.resolve(5),
    ];
    pact(tasks, 2, false).then((stats) => {
      expect(stats.results[2]).toBe('error!');
      expect(stats).toMatchSnapshot();
      done();
    });
  });

  describe('pact.splitArrayIntoBatches', () => {

    it('should be a function', () => {
      expect(typeof pact.splitArrayIntoBatches).toBe('function');
    });

    it('should split array into array of arrays, where each subarray has a given length limit', () => {
      expect(pact.splitArrayIntoBatches([1, 2, 3, 4, 5], 4)).toMatchSnapshot();
    });

  });

});

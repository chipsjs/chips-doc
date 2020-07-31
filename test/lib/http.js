const nock = require('nock');
const { assert } = require('chai');

const { http } = require('../../lib');

describe('http lib', () => {
  let result;

  before('mock server', () => {
    nock('http://localhost')
      .get('/abc?key1=d')
      .times(1)
      .reply(200, {
        flag: true
      })
      .get('/abc?key1=c')
      .times(1)
      .reply(403)
  });

  describe('query request', () => {
    before('request', async () => {
      result = await http.request({
        base_url: 'http://localhost',
        path: '/abc',
        params: {
          key1: 'd'
        }
      });
    });

    it('response correct', () => {
      assert.nestedPropertyVal(result, 'status', 200);
      assert.nestedPropertyVal(result, 'data.flag', true);
    })
  });

  describe('throw error when response status code is not 200', () => {
    let error;

    before('request', async () => {
      try {
        await http.request({
          base_url: 'http://localhost',
          path: '/abc',
          params: {
            key1: 'c'
          }
        });
      } catch (err) {
        error = err.message;
      }
    });

    it('response correct', () => {
      assert.strictEqual(error, 'request fail, status code is 403');
    })
  });
});

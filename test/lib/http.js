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
});

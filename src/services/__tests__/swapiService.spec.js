import { stub } from 'sinon';
import {fetcher} from '../fetcher.js';
import {swapiService} from '../swapiService.js';
import { API_ENDPOINT } from '../../constants/appConstants.js';
import { cache } from '../../cache.js';

describe('swapiService', () => {
  let fetcherStub;

  beforeEach(() => {
    fetcherStub = stub(fetcher, 'get');
    cache.clear();
  });

  afterEach(() => {
    fetcherStub.restore();
  });

  describe('getPeople', () => {
    it('should call /people endpoint with page query parameter', async () => {
      fetcherStub.resolves({
        data: {
          results: [],
          total: 86,
        }
      });
      await swapiService.getPeople(12);
      expect(fetcherStub.calledOnce).toBe(true);
      expect(fetcherStub.getCall(0).args[0]).toEqual('people/?page=12');
    });

    it('should reject when /people endpoint fails', async () => {

    });
  });

  describe('loadResource', () => {
    it('should call get method with url string after domain', async () => {
      fetcherStub.resolves({
        data: 'some data'
      });
      const result = await swapiService.loadResource(`https://${API_ENDPOINT}/some-resource/123`);
      expect(fetcherStub.calledOnce).toBe(true);
      expect(fetcherStub.getCall(0).args[0]).toBe('some-resource/123');
      expect(result).toBe('some data');
    });

    it('should not call get method when called with the same parameter again and return the same promise', async () => {
      const resource = `https://${API_ENDPOINT}/some-resource/123`;
      fetcherStub.resolves({
        data: 'some data'
      });
      const result = await swapiService.loadResource(resource);
      const result1 = await swapiService.loadResource(resource);
      const result2 = await swapiService.loadResource(resource);
      expect(fetcherStub.calledOnce).toBe(true);
      expect(fetcherStub.getCall(0).args[0]).toBe('some-resource/123');
      expect(result).toBe('some data');
      expect(result1).toBe('some data');
      expect(result2).toBe('some data');
    });

    it('should reject promise if parameter doesnt match domain', async (done) => {
      fetcherStub.resolves({
        data: 'some data'
      });
      try {
        await swapiService.loadResource('https://fake-endpoint/some-resource/123');
      } catch (e) {
        done();
        return;
      }
      throw new Error('should reject promise if parameter doesnt match domain but didnt')
    });

    it('should reject promise if api call fails', async (done) => {
      fetcherStub.rejects();
      try {
        await swapiService.loadResource(`https://${API_ENDPOINT}/some-resource/123`);
      } catch (e) {
        expect(fetcherStub.calledOnce).toBe(true);
        expect(fetcherStub.getCall(0).args[0]).toBe('some-resource/123');
        done();
        return;
      }
      throw new Error('should reject promise if api call fails but didnt')
    });
  });
});

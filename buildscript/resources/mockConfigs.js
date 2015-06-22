'use strict';

module.exports = {
	okConfigs: {
		blocket: {
			client: 'blocket',
			config: [
				{
					throttle: 1,
					dataCollector: 'https://collector.schibsted.io/api/v1/track',
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		},
		generic: {
			client: '',
			config: [
				{
					throttle: 0.5,
					dataCollector: 'https://collector.schibsted.io/api/v1/track',
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		},
		finn: {
			client: 'finn',
			config: [
				{
					throttle: 1,
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		},
		vg: {
			client: 'vg',
			config: [
				{
					throttle: 1,
					dataCollector: 'https://collector.schibsted.io/api/v1/track'
				}
			]
		},
		bt: {
			client: 'bt',
			config: [
				{
					throttle: 0.1
				},
				{
					throttle: 0.5,
					dataCollector: 'https://collector.schibsted.io/api/v1/track',
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		}
	},
	faultyConfigs: {
		blocket: {
			client: 'Blocket',
			config: [
				{
					throttle: 1,
					dataCollector: 'https://collector.schibsted.io/api/v1/track',
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		},
		generic: {
			client: '',
			config: [
				{
					throttle: -0.5,
					dataCollector: 'https://collector.schibsted.io/api/v1/track',
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		},
		finn: {
			client: 'finn',
			config: [
				{
					trottle: 1,
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		},
		vg: {
			client: 'vg',
			config: {
				throttle: 1,
				dataCollector: 'https://collector.schibsted.io/api/v1/track'
			}
		},
		bt: {
			client: 'bt',
			config: [
				{
					throttle: 0.1
				},
				{
					dataCollector: 'https://collector.schibsted.io/api/v1/track',
					cis: 'https://cis.schibsted.com/api/v1/identify'
				}
			]
		},
		prisjakt: {
			client: 1234123,
			config: [
				{
					throttle: 1
				}
			]
		},
		lendo: {
			client: 'lendo',
			config: []
		},
		lbc: {
			client: 'lbc',
			config: [
				{
					throttle: 1,
					dataCollector: true
				}
			]
		},
		svd: {
			client: 'svd',
			config: [
				{
					throttle: 1,
					dataCollector: 'normal'
				}
			]
		},
		aftonbladet: {
			client: 'aftonbladet',
			config: [
				{
					throttle: 1,
					cis: 123
				}
			]
		},
		aftenposten: {
			client: 'aftenposten',
			config: [
				{
					throttle: 1,
					cis: 'cis.schibsted.com'
				}
			]
		}
	}
};

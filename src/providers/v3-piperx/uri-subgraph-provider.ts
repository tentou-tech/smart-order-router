import { URISubgraphProvider } from '../uri-subgraph-provider';

import { IV3PiperxSubgraphProvider, V3PiperxSubgraphPool } from './subgraph-provider';

export class V3PiperxURISubgraphProvider
  extends URISubgraphProvider<V3PiperxSubgraphPool>
  implements IV3PiperxSubgraphProvider {}

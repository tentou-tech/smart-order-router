import { URISubgraphProvider } from '../uri-subgraph-provider';
import { IV3SubgraphProvider, V3SubgraphPool } from '../v3/subgraph-provider';

export class V3PiperxURISubgraphProvider
  extends URISubgraphProvider<V3SubgraphPool>
  implements IV3SubgraphProvider {}

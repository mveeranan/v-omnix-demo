export interface Mapper<TSource, TDestination> {
  map(source: TSource): TDestination;
}

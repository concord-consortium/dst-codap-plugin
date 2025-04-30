# Map Bounds Optimization Design

## Overview
This document outlines the design for optimizing how we determine and set map bounds when loading datasets in the CODAP Data Science Toolkit (DST) plugin.

## Current Issues
1. Slow initial rendering due to blocking bounds calculation
2. Multiple redundant API calls to CODAP
3. Inefficient processing of large datasets
4. Poor user feedback during loading

## Design Goals
1. Immediate visual feedback for users
2. Efficient bounds calculation
3. Smooth transitions between views
4. Graceful degradation for edge cases

## Technical Design

### Core Components

1. MapBoundsManager
```typescript
interface Bounds {
  minLat: number;
  maxLat: number;
  minLong: number;
  maxLong: number;
}

class MapBoundsManager {
  // Initial world bounds setup
  setWorldMapBounds(): void;
  
  // Get bounds from CODAP attribute stats
  tryGetAttributeStats(dataContextName: string): Promise<Bounds | null>;
  
  // Fallback sampling approach
  getSampledBounds(dataContextName: string, sampleSize?: number): Promise<Bounds | null>;
  
  // Animate to new bounds
  animateToDataBounds(bounds: Bounds): void;
}
```

2. Optimization Strategies

a. Pre-computed Stats Strategy
- Uses CODAP's built-in attribute statistics
- Single API call to get collection attributes
- Fastest when stats are available

b. Sampling Strategy
- Fixed-size sampling (default 200 cases)
- Parallel processing of coordinate extraction
- Constant time complexity regardless of dataset size

### Implementation Phases

1. Phase 1: Core Infrastructure
- Create MapBoundsManager class
- Implement world bounds initialization
- Add basic types and interfaces

2. Phase 2: Stats-based Strategy
- Implement attribute stats retrieval
- Add bounds calculation from stats
- Handle edge cases and errors

3. Phase 3: Sampling Strategy
- Implement efficient sampling
- Add parallel processing
- Optimize sample size

4. Phase 4: Integration
- Connect with existing codebase
- Add smooth transitions
- Implement error handling

### Testing Strategy

1. Unit Tests
- Test each strategy independently
- Verify bounds calculations
- Test error handling

2. Integration Tests
- Test with CODAP API
- Verify smooth transitions
- Test with various dataset sizes

3. Performance Tests
- Measure initial render time
- Test with large datasets
- Compare with previous implementation

### Error Handling

1. Graceful Degradation
- Fall back to world bounds on error
- Log detailed error information
- Maintain responsive UI

2. Edge Cases
- Handle missing attributes
- Deal with invalid coordinates
- Manage timeout scenarios

## Success Metrics

1. Performance
- Initial render under 500ms
- Bounds calculation under 2s for large datasets
- Smooth animations (60fps)

2. Reliability
- 99.9% success rate for bounds calculation
- Zero UI freezes
- Graceful error handling

3. User Experience
- Immediate visual feedback
- Smooth transitions
- Clear loading indicators

## Future Enhancements

1. Caching
- Cache bounds for frequently used datasets
- Implement bounds prediction

2. Progressive Loading
- Stream bounds updates
- Implement progressive refinement

3. Advanced Optimization
- WebWorker for heavy calculations
- Predictive pre-loading 
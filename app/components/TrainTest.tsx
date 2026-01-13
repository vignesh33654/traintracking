'use client';

import { useState } from 'react';
import { useTrainData, formatDelay, formatTime } from '@/app/hooks/useTrainData';
import { API_CONFIG } from '@/app/config/api.config';

export function TrainTest() {
  const [trainNumber, setTrainNumber] = useState(API_CONFIG.testTrainNumber);
  const [searchTrain, setSearchTrain] = useState(API_CONFIG.testTrainNumber);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTrainData(searchTrain, {
    refetchInterval: 60000, // Refresh every 1 minute
  });

  const handleSearch = () => {
    if (trainNumber.trim()) {
      setSearchTrain(trainNumber.trim());
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">
          🚂 Train Tracker
        </h1>
        {API_CONFIG.useMockAPI && (
          <span className="text-xs bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            Mock Mode
          </span>
        )}
      </div>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={trainNumber}
          onChange={(e) => setTrainNumber(e.target.value)}
          placeholder="Enter train number (e.g., 12301)"
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-8 dark:text-gray-300">
          <p>Loading train data...</p>
        </div>
      )}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error: {error?.message || 'Failed to fetch train data'}
          </p>
          {error?.status && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              Status: {error.status}
            </p>
          )}
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {data && !isError && (
        <div className="space-y-4">
          {isFetching && !isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Refreshing...
            </p>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white">
              {data.train.trainNumber} - {data.train.trainName}
            </h2>
            {data.train.hindiName && data.train.hindiName !== 'null' && (
              <p className="text-gray-600 dark:text-gray-400">
                {data.train.hindiName}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {data.train.sourceStationName} ({data.train.sourceStationCode}) →{' '}
              {data.train.destinationStationName} ({data.train.destinationStationCode})
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Type: {data.train.type} | Zone: {data.train.zone} | Distance: {data.train.distanceKm} km
            </p>
          </div>

          {data.metadata.hasLiveData && data.liveData ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-400">
                📍 Live Status
              </h3>
              
              {data.liveData.currentLocation && (
                <div className="mt-2 space-y-1 text-green-700 dark:text-green-300">
                  <p>
                    <strong>Status:</strong> {data.liveData.currentLocation.status}
                  </p>
                  <p>
                    <strong>Current Station:</strong> {data.liveData.currentLocation.stationCode}
                  </p>
                  <p>
                    <strong>Position:</strong> Lat {data.liveData.currentLocation.latitude}, 
                    Lng {data.liveData.currentLocation.longitude}
                  </p>
                  <p>
                    <strong>Distance from Origin:</strong> {data.liveData.currentLocation.distanceFromOriginKm} km
                  </p>
                </div>
              )}
              
              <p className="mt-2 text-green-600 dark:text-green-400">
                <strong>Overall Delay:</strong> {formatDelay(data.liveData.overallDelayMinutes)}
              </p>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Last updated: {new Date(data.liveData.lastUpdatedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-700 dark:text-yellow-400">
                ⚠️ Live data not available. 
                {data.metadata.journeyStatus?.status === 'NOT_STARTED' && ' Train has not started yet.'}
                {data.metadata.journeyStatus?.status === 'COMPLETED' && ' Journey completed.'}
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border dark:border-gray-700">
            <h3 className="font-semibold dark:text-white mb-3">
              📋 Route ({data.route.length} stations)
            </h3>
            <div className="space-y-2">
              {data.route.slice(0, 5).map((station, index) => (
                <div
                  key={station.id || index}
                  className="flex justify-between text-sm border-b dark:border-gray-700 pb-2"
                >
                  <span className="dark:text-gray-300">
                    {station.sequence}. {station.stationName} ({station.stationCode})
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Arr: {formatTime(station.scheduledArrival)} | 
                    Dep: {formatTime(station.scheduledDeparture)}
                  </span>
                </div>
              ))}
              {data.route.length > 5 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  ... and {data.route.length - 5} more stations
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            <p>Journey Date: {data.metadata.journeyStatus?.journeyDate || 'N/A'}</p>
            <p>Journey Status: {data.metadata.journeyStatus?.status || 'N/A'}</p>
            <p>Can Refresh Live: {data.metadata.canRefreshLive ? 'Yes' : 'No'}</p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {isFetching ? 'Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
      )}
    </div>
  );
}


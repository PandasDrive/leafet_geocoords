
import struct
from abc import ABC, abstractmethod

class SignalParser(ABC):
    """Abstract base class for signal parsers."""
    @abstractmethod
    def parse(self, data_chunk):
        """Parses a 16-byte chunk and returns a dictionary of data."""
        pass

class SignalAParser(SignalParser):
    """Parses Signal A type."""
    def parse(self, data_chunk):
        # Unpack as little-endian signed integers
        lat_int = struct.unpack('<i', data_chunk[8:12])[0]
        lon_int = struct.unpack('<i', data_chunk[12:16])[0]
        
        # Apply scaling factor
        lat_float = lat_int / 100000.0
        lon_float = lon_int / 100000.0
        
        return {'lat': lat_float, 'lng': lon_float, 'type': 'A'}

class SignalBParser(SignalParser):
    """Parses Signal B type."""
    def parse(self, data_chunk):
        # Unpack as big-endian floats
        # Longitude is at bytes 6-9, Latitude is at bytes 10-13
        lon_float, lat_float = struct.unpack('>ff', data_chunk[6:14])
        
        return {'lat': lat_float, 'lng': lon_float, 'type': 'B'}

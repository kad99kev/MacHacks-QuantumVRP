import numpy as np
from math import radians, cos, sin, asin, sqrt


class Initializer:
    def __init__(self, n):
        self.n = n

    def generate_instance(self, xc, yc):

        n = self.n

        instance = np.zeros([n, n])
        for ii in range(0, n):
            for jj in range(ii + 1, n):

                instance[ii, jj] = self.get_long_lat_dist(
                    yc[ii], yc[jj], xc[ii], xc[jj]
                )
                print(instance[ii, jj])
                instance[jj, ii] = instance[ii, jj]

        return instance

    def get_long_lat_dist(self, lat1, lat2, lon1, lon2):
        # The math module contains a function named
        # radians which converts from degrees to radians.
        lon1 = radians(lon1)
        lon2 = radians(lon2)
        lat1 = radians(lat1)
        lat2 = radians(lat2)

        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2

        c = 2 * asin(sqrt(a))

        # Radius of earth in kilometers. Use 3956 for miles
        r = 6371

        # calculate the result
        return c * r

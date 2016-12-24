#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import cgi
import cgitb
import math
import json

MJD_AT_J2000 = 51544
UNUMBERED_BODIES_FILE = '../res/ELEMENTS.UNNUM'
NUMBERED_BODIES_FILE = '../res/ELEMENTS.NUMBR'

def main():
    cgitb.enable()
    print "Content-type: text/html\n"
    search_results = []
    search_querry =  get_search_querry().upper()
    search_unumbered_bodies(search_querry, search_results)
    search_numbered_bodies(search_querry, search_results)
    print(json.JSONEncoder().encode(search_results))


def get_search_querry():
    form = cgi.FieldStorage()
    return form.getvalue('name')


def search_unumbered_bodies(querry, search_results):
    file = open(UNUMBERED_BODIES_FILE, 'r')
    file.readline()
    file.readline()
    line = file.readline()
    while line:
        designation = line[0:11].strip().upper()
        if querry in designation:
            search_results.append(parse_unumbered_body(line))
        line = file.readline()

def parse_unumbered_body(line):
    name = line[0 : 11].strip()
    epoch = int(line[12 : 17])
    semimajor_axis = float(line[18 : 29])
    eccentricty = float(line[30 : 40])
    inclination = math.radians(float(line[41 : 50]))
    arg_of_pericenter = math.radians(float(line[51 : 60]))
    longitude_of_node = math.radians(float(line[61 : 70]))
    mean_anomaly_at_epoch = math.radians(float(line[70 : 82]))
    longitude_of_pericenter = arg_of_pericenter + longitude_of_node
    mean_anomaly2000 = get_mean_anomaly2000(semimajor_axis, mean_anomaly_at_epoch, epoch)
    return orbital_elements2dictionary(name, semimajor_axis, eccentricty, inclination, longitude_of_node, longitude_of_pericenter, mean_anomaly2000)

def search_numbered_bodies(querry, search_results):
    file = open(NUMBERED_BODIES_FILE, 'r')
    file.readline()
    file.readline()
    line = file.readline()
    while line:
        designation = line[6 : 25].strip().upper()
        if querry in designation:
            search_results.append(parse_numbered_body(line))
        line = file.readline()

def parse_numbered_body(line):
    name = line[7 : 24].strip()
    epoch = int(line[25 : 30])
    semimajor_axis = float(line[31 : 41])
    eccentricty = float(line[42 : 52])
    inclination = math.radians(float(line[53 : 62]))
    arg_of_pericenter = math.radians(float(line[63 : 72]))
    longitude_of_node = math.radians(float(line[73 : 82]))
    mean_anomaly_at_epoch = math.radians(float(line[83 : 94]))
    longitude_of_pericenter = arg_of_pericenter + longitude_of_node
    mean_anomaly2000 = get_mean_anomaly2000(semimajor_axis, mean_anomaly_at_epoch, epoch)
    return orbital_elements2dictionary(name, semimajor_axis, eccentricty, inclination, longitude_of_node, longitude_of_pericenter, mean_anomaly2000)



def orbital_elements2dictionary(name, semimajor_axis, eccentricty, inclination, longitude_of_node, longitude_of_pericenter, mean_anomaly2000):
    body = {
        'name' : name,
        'semiMajorAxis': semimajor_axis,
        'eccentricty' : eccentricty,
        'inclination' : inclination,
        'longitudeOfNode' : longitude_of_node,
        'longitudeOfPericenter' : longitude_of_pericenter,
        'meanAnomaly2000' : mean_anomaly2000
    }

    return body

def get_mean_anomaly2000(semimajor_axis, mean_anomaly_at_epoch, epoch):
    mean_angular_speed = 2.0 * math.pi / math.sqrt(semimajor_axis * semimajor_axis * semimajor_axis)
    mean_anomaly2000 = mean_anomaly_at_epoch - mean_angular_speed * (epoch - MJD_AT_J2000) / 365.25
    while mean_anomaly2000 < 0:
        mean_anomaly2000 += 2 * math.pi
    return mean_anomaly2000

if __name__ == "__main__":
    main()

// @flow
import * as React from "react";
import {
  Segment,
  Button,
  Icon,
  Grid,
  Dimmer,
  Loader,
  Header,
  List,
  Form,
  Accordion
} from "semantic-ui-react";
import "semantic-ui-css/semantic.css";

const chrome = window.chrome;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      cities: [
        {
          name: "Cairo",
          url:
            "https://spotthestation.nasa.gov/sightings/xml_files/Egypt_None_Cairo.xml"
        }
      ],
      duration: 3,
      loading: false
    };
  }

  componentDidMount() {
    chrome.storage.sync.get(["cities"], ({ cities }) => {
      console.log(cities);
      if (cities != null) {
        this.setState({ cities }, this.updateSightings);
      }
    });

    setInterval(this.updateSightings, 10000);
    this.updateSightings();
  }

  saveChanges() {
    chrome.storage.sync.set({ cities: this.state.cities });
  }

  updateSightings = async () => {
    const cities = await getSightings(this.state.cities);
    this.setState({ cities });
  };

  render() {
    const { cities, loading, editing } = this.state;
    const citiesPanel = cities.map((city, i) => ({
      key: i,
      title: city.name,
      content: city.sightings
        ? city.sightings.map((s, i) => (
            <List divided inverted relaxed key={i}>
              <List.Item>
                <List>
                  {s.info.map((e, i) => (
                    <List.Item key={i}>{e}</List.Item>
                  ))}
                </List>
              </List.Item>
            </List>
          ))
        : null
    }));

    return (
      <Grid padded>
        {loading ? (
          <Dimmer active>
            <Loader />
          </Dimmer>
        ) : null}
        <Grid.Row>
          <Grid.Column width={5} />
          <Grid.Column textAlign="center" width={6}>
            <Header as="h2">Spot the station</Header>
          </Grid.Column>
          <Grid.Column width={5}>
            <Button
              onClick={() => {
                this.setState({ editing: !editing });
                editing && this.saveChanges();
              }}
            >
              {editing ? "Save" : "Edit"}
            </Button>
          </Grid.Column>
        </Grid.Row>
        {editing ? (
          <Grid.Row>
            <Grid.Column>
              <Form>
                {cities.map((c, i) => (
                  <Form.Group key={i}>
                    <Form.Input
                      width={6}
                      label="City name"
                      placeholder="First name"
                      value={c.name}
                      onChange={(e, { value }) =>
                        this.setState({
                          cities: cities.map(
                            (city, j) =>
                              i === j ? { ...city, name: value } : city
                          )
                        })
                      }
                    />
                    <Form.Input
                      width={9}
                      label="URL"
                      placeholder="Last name"
                      value={c.url}
                      onChange={(e, { value }) =>
                        this.setState({
                          cities: cities.map(
                            (city, j) =>
                              i === j ? { ...city, url: value } : city
                          )
                        })
                      }
                    />
                    <Form.Button
                      label="Delete"
                      icon
                      onClick={() =>
                        this.setState({
                          cities: cities.filter((city, j) => i !== j)
                        })
                      }
                    >
                      <Icon name="delete" />
                    </Form.Button>
                  </Form.Group>
                ))}
                <Form.Group>
                  <Form.Button
                    positive
                    onClick={() =>
                      this.setState({
                        cities: [...cities, { name: "", url: "" }]
                      })
                    }
                  >
                    Add City
                  </Form.Button>
                </Form.Group>
              </Form>
            </Grid.Column>
          </Grid.Row>
        ) : (
          <Grid.Row>
            <Grid.Column>
              <Segment inverted>
                <Accordion
                  defaultActiveIndex={0}
                  panels={citiesPanel}
                  inverted
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    );
  }
}

function getSightings(cities) {
  const citiesUpdated = cities.map(
    async city =>
      await fetch(city.url)
        .then(response => response.text())
        .then(response => ({
          ...city,
          sightings: parseResponse(response)
        }))
  );
  return Promise.all(citiesUpdated);
}

function parseResponse(response) {
  const xmlDoc = new DOMParser().parseFromString(response, "text/xml");
  const sightings = [...xmlDoc.getElementsByTagName("description")]
    .map(s => s.textContent)
    .filter(s => /.*Duration: \d+.*/i.test(s))
    .map(s => ({
      duration: +s.match(/.*Duration: (\d+).*/i)[1],
      info: s
        .split("<br/>")
        .map(e => e.trim())
        .filter(e => e !== "")
    }));
  return sightings;
}

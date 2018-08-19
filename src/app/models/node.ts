import APP_CONFIG from '../app.config';

export class Node implements d3.SimulationNodeDatum {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  linkCount = 0;

  id: string;

  r: number; // todo: assign radius function & getter
  cluster: number;
  clusterValue: string;

  skillsLang: number;
  skillsLogi: number;
  skillsMath: number;
  skillsComp: number;

  all: Object;

  constructor(id, props) {
    this.id = id;

    this.r = props.r;
    this.cluster = props.cluster;
    this.clusterValue = props.clusterValue;
    this.skillsLang = props.skillsLang;
    this.skillsLogi = props.skillsLogi;
    this.skillsMath = props.skillsMath;
    this.skillsComp = props.skillsComp;
    this.all = props.all;
  }

  // normal = () => {
  //   return Math.sqrt(this.linkCount / APP_CONFIG.N);
  // }

  // get r() {
  //   return 50 * this.normal() + 10;
  // }

  // get fontSize() {
  //   return 30 * this.normal() + 10 + 'px';
  // }

  get color() {
    // todo: consider using opacity in addition to color/size
    // const index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
    return APP_CONFIG.SPECTRUM[this.cluster];
  }
}

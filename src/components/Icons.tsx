export function SendIcon() {
  return (
    <svg
      height="30px"
      width="30px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      className="group-hover:scale-[1.1] transition-transform duration-500 ease-in-out"
    >
      <title>Send</title>
      <circle style={{ fill: "#B5F1F4" }} cx="256" cy="256" r="256" />
      <path
        style={{ fill: "#84DBFF" }}
        d="M394.799,256l-98.573-1.724l-185.465,21.549l223.858,223.856
          c71.623-23.092,129.455-76.869,158.008-145.854L394.799,256z"
      />
      <g className="group-hover:translate-x-10 transition-transform duration-500 ease-in-out">
        <polygon
          style={{ fill: "#324A5E" }}
          points="300.327,161.528 272.289,189.566 318.898,236.175 110.761,236.175 110.761,275.825 
	318.898,275.825 272.289,322.434 300.327,350.472 394.799,256 "
        />
        <polygon
          style={{ fill: "#2B3B4E" }}
          points="110.761,275.825 318.898,275.825 272.289,322.434 300.327,350.472 394.799,256 110.761,256 
	"
        />
      </g>
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Settings</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C22 19.0711 22 16.714 22 12C22 7.28595 22 4.92893 20.5355 3.46447C19.0711 2 16.714 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355ZM18.75 16C18.75 16.4142 18.4142 16.75 18 16.75H6C5.58579 16.75 5.25 16.4142 5.25 16C5.25 15.5858 5.58579 15.25 6 15.25H18C18.4142 15.25 18.75 15.5858 18.75 16ZM18 12.75C18.4142 12.75 18.75 12.4142 18.75 12C18.75 11.5858 18.4142 11.25 18 11.25H6C5.58579 11.25 5.25 11.5858 5.25 12C5.25 12.4142 5.58579 12.75 6 12.75H18ZM18.75 8C18.75 8.41421 18.4142 8.75 18 8.75H6C5.58579 8.75 5.25 8.41421 5.25 8C5.25 7.58579 5.58579 7.25 6 7.25H18C18.4142 7.25 18.75 7.58579 18.75 8Z"
        fill="#949496"
        className="group-hover:fill-[#e6e7e8]"
      />
    </svg>
  );
}

export function AddIcon({ title }: { title: string }) {
  return (
    <svg
      width="30px"
      height="30px"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="group-hover:scale-110 transition-all ease-in-out"
    >
      <title>{title}</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
        fill="#949496"
        className="group-hover:fill-[#e6e7e8]"
      />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg
      width="25px"
      height="25px"
      viewBox="0 0 32 32"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="group-hover:scale-110 transition-all ease-in-out"
    >
      <title>Upload Image</title>
      <defs></defs>
      <g
        id="Page-1"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <g id="Icon-Set-Filled" transform="translate(-362.000000, -101.000000)">
          <path
            d="M392,129 C392,130.104 391.104,131 390,131 L384.832,131 L377.464,123.535 L386,114.999 L392,120.999 L392,129 L392,129 Z M366,131 C364.896,131 364,130.104 364,129 L364,128.061 L371.945,120.945 L382.001,131 L366,131 L366,131 Z M370,105 C372.209,105 374,106.791 374,109 C374,111.209 372.209,113 370,113 C367.791,113 366,111.209 366,109 C366,106.791 367.791,105 370,105 L370,105 Z M390,101 L366,101 C363.791,101 362,102.791 362,105 L362,129 C362,131.209 363.791,133 366,133 L390,133 C392.209,133 394,131.209 394,129 L394,105 C394,102.791 392.209,101 390,101 L390,101 Z M370,111 C371.104,111 372,110.104 372,109 C372,107.896 371.104,107 370,107 C368.896,107 368,107.896 368,109 C368,110.104 368.896,111 370,111 L370,111 Z"
            id="image-picture"
            fill="#D9D9D9"
            className="group-hover:fill-[#e6e7e8]"
          ></path>
        </g>
      </g>
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg
      width="30px"
      height="30px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Close</title>
      <path
        d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
        stroke="#f1f1f1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
        stroke="#f1f1f1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      width="18px"
      height="18px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Delete Chat</title>
      <path
        d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#f1f1f1"
      />
      <path
        d="M20.5 6H3.49988"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#f1f1f1"
      />
      <path
        d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#f1f1f1"
      />
      <path
        d="M9.5 11L10 16"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#f1f1f1"
      />
      <path
        d="M14.5 11L14 16"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#f1f1f1"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      fill="#ffffff"
      height="12px"
      width="12px"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 -15 512 512"
      xmlSpace="preserve"
    >
      <g>
        <path
          d="M474.045,173.813c-4.201,1.371-6.494,5.888-5.123,10.088c7.571,23.199,11.411,47.457,11.411,72.1
		c0,62.014-24.149,120.315-68,164.166s-102.153,68-164.167,68s-120.316-24.149-164.167-68S16,318.014,16,256
		S40.149,135.684,84,91.833s102.153-68,164.167-68c32.889,0,64.668,6.734,94.455,20.017c28.781,12.834,54.287,31.108,75.81,54.315
		c3.004,3.239,8.066,3.431,11.306,0.425c3.24-3.004,3.43-8.065,0.426-11.306c-23-24.799-50.26-44.328-81.024-58.047
		C317.287,15.035,283.316,7.833,248.167,7.833c-66.288,0-128.608,25.813-175.48,72.687C25.814,127.392,0,189.712,0,256
		c0,66.287,25.814,128.607,72.687,175.479c46.872,46.873,109.192,72.687,175.48,72.687s128.608-25.813,175.48-72.687
		c46.873-46.872,72.687-109.192,72.687-175.479c0-26.332-4.105-52.26-12.201-77.064
		C482.762,174.736,478.245,172.445,474.045,173.813z"
        />
        <path
          d="M504.969,83.262c-4.532-4.538-10.563-7.037-16.98-7.037s-12.448,2.499-16.978,7.034l-7.161,7.161
		c-3.124,3.124-3.124,8.189,0,11.313c3.124,3.123,8.19,3.124,11.314-0.001l7.164-7.164c1.51-1.512,3.52-2.344,5.66-2.344
		s4.15,0.832,5.664,2.348c1.514,1.514,2.348,3.524,2.348,5.663s-0.834,4.149-2.348,5.663L217.802,381.75
		c-1.51,1.512-3.52,2.344-5.66,2.344s-4.15-0.832-5.664-2.348L98.747,274.015c-1.514-1.514-2.348-3.524-2.348-5.663
		c0-2.138,0.834-4.149,2.351-5.667c1.51-1.512,3.52-2.344,5.66-2.344s4.15,0.832,5.664,2.348l96.411,96.411
		c1.5,1.5,3.535,2.343,5.657,2.343s4.157-0.843,5.657-2.343l234.849-234.849c3.125-3.125,3.125-8.189,0-11.314
		c-3.124-3.123-8.189-3.123-11.313,0L212.142,342.129l-90.75-90.751c-4.533-4.538-10.563-7.037-16.98-7.037
		s-12.448,2.499-16.978,7.034c-4.536,4.536-7.034,10.565-7.034,16.977c0,6.412,2.498,12.441,7.034,16.978l107.728,107.728
		c4.532,4.538,10.563,7.037,16.98,7.037c6.417,0,12.448-2.499,16.977-7.033l275.847-275.848c4.536-4.536,7.034-10.565,7.034-16.978
		S509.502,87.794,504.969,83.262z"
        />
      </g>
    </svg>
  );
}

export function GifIcon() {
  return (
    <svg
      width="30px"
      height="30px"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Pick a Gif</title>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g
          id="ic_fluent_gif_24_filled"
          fillRule="nonzero"
          fill="#949496"
          className="group-hover:fill-white"
        >
          <path d="M18.75,3.50054297 C20.5449254,3.50054297 22,4.95561754 22,6.75054297 L22,17.2531195 C22,19.048045 20.5449254,20.5031195 18.75,20.5031195 L5.25,20.5031195 C3.45507456,20.5031195 2,19.048045 2,17.2531195 L2,6.75054297 C2,4.95561754 3.45507456,3.50054297 5.25,3.50054297 L18.75,3.50054297 Z M8.01459972,8.87193666 C6.38839145,8.87193666 5.26103525,10.2816525 5.26103525,11.9943017 C5.26103525,13.707564 6.38857781,15.1202789 8.01459972,15.1202789 C8.90237918,15.1202789 9.71768065,14.6931811 10.1262731,13.9063503 L10.2024697,13.7442077 L10.226,13.674543 L10.2440163,13.5999276 L10.2440163,13.5999276 L10.2516169,13.5169334 L10.2518215,11.9961937 L10.2450448,11.9038358 C10.2053646,11.6359388 9.99569349,11.4234501 9.72919932,11.3795378 L9.62682145,11.3711937 L8.62521827,11.3711937 L8.53286035,11.3779703 C8.26496328,11.4176506 8.05247466,11.6273217 8.00856234,11.8938159 L8.00021827,11.9961937 L8.00699487,12.0885517 C8.0466751,12.3564487 8.25634623,12.5689373 8.5228404,12.6128497 L8.62521827,12.6211937 L9.00103525,12.6209367 L9.00103525,13.3549367 L8.99484486,13.3695045 C8.80607251,13.6904125 8.44322427,13.8702789 8.01459972,13.8702789 C7.14873038,13.8702789 6.51103525,13.0713011 6.51103525,11.9943017 C6.51103525,10.9182985 7.14788947,10.1219367 8.01459972,10.1219367 C8.43601415,10.1219367 8.67582824,10.1681491 8.97565738,10.3121334 C9.28681641,10.4615586 9.6601937,10.3304474 9.80961888,10.0192884 C9.95904407,9.70812933 9.82793289,9.33475204 9.51677386,9.18532686 C9.03352891,8.95326234 8.61149825,8.87193666 8.01459972,8.87193666 Z M12.6289445,8.99393497 C12.3151463,8.99393497 12.0553614,9.22519285 12.0107211,9.52657705 L12.0039445,9.61893497 L12.0039445,14.381065 L12.0107211,14.4734229 C12.0553614,14.7748072 12.3151463,15.006065 12.6289445,15.006065 C12.9427427,15.006065 13.2025276,14.7748072 13.2471679,14.4734229 L13.2539445,14.381065 L13.2539445,9.61893497 L13.2471679,9.52657705 C13.2025276,9.22519285 12.9427427,8.99393497 12.6289445,8.99393497 Z M17.6221579,9.00083497 L15.6247564,8.99393111 C15.3109601,8.99285493 15.0503782,9.22321481 15.0046948,9.52444312 L14.9975984,9.61677709 L14.9975984,14.3649711 L15.0043751,14.4573291 C15.0440553,14.7252261 15.2537265,14.9377148 15.5202206,14.9816271 L15.6225985,14.9899711 L15.7149564,14.9831945 C15.9828535,14.9435143 16.1953421,14.7338432 16.2392544,14.467349 L16.2475985,14.3649711 L16.2470353,13.2499367 L17.37,13.2504012 L17.4623579,13.2436246 C17.730255,13.2039444 17.9427436,12.9942732 17.9866559,12.7277791 L17.995,12.6254012 L17.9882234,12.5330433 C17.9485432,12.2651462 17.738872,12.0526576 17.4723779,12.0087453 L17.37,12.0004012 L16.2470353,11.9999367 L16.2470353,10.2449367 L17.6178421,10.2508313 L17.7102229,10.2443727 C18.0117595,10.2007704 18.2439132,9.94178541 18.2450039,9.62798912 C18.24608,9.31419284 18.0157202,9.05361096 17.7144919,9.00793041 L17.6221579,9.00083497 L15.6247564,8.99393111 L17.6221579,9.00083497 Z"></path>
        </g>
      </g>
    </svg>
  );
}

export function AddUsersIcon() {
  return (
    <svg
      height="25px"
      width="25px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 368.373 368.373"
      xmlSpace="preserve"
      fill="#949496"
      className="group-hover:fill-white group-hover:scale-110 transition-all ease-in-out"
    >
      <title>Add Users to DM</title>
      <g id="XMLID_91_">
        <path
          id="XMLID_92_"
          d="M293.373,226.936h-15v-15c0-8.284-6.716-15-15-15c-8.284,0-15,6.716-15,15v15h-15c-8.284,0-15,6.716-15,15
		c0,8.284,6.716,15,15,15h15v15c0,8.284,6.716,15,15,15c8.284,0,15-6.716,15-15v-15h15c8.284,0,15-6.716,15-15
		C308.373,233.652,301.657,226.936,293.373,226.936z"
        />
        <path
          id="XMLID_93_"
          d="M263.373,136.936c-34.485,0-65.14,16.713-84.293,42.463c-7.653-1.61-15.582-2.463-23.707-2.463
		c-8.643,0-17.064,0.965-25.165,2.781c-38.121,8.543-69.149,36.066-82.606,72.092c-4.669,12.5-7.229,26.02-7.229,40.127
		c0,8.284,6.716,15,15,15h125.596c19.246,24.348,49.03,40,82.404,40c57.898,0,105-47.102,105-105S321.271,136.936,263.373,136.936z
		 M263.373,316.936c-13.592,0-26.339-3.652-37.344-10c-22.48-12.967-37.656-37.236-37.656-65c0-20.01,7.892-38.199,20.708-51.662
		c13.67-14.359,32.946-23.338,54.292-23.338c41.355,0,75,33.645,75,75S304.728,316.936,263.373,316.936z"
        />
        <path
          id="XMLID_104_"
          d="M32.622,84.187c0,23.666,18.367,43.109,41.594,44.857c-7.382-13.302-11.594-28.596-11.594-44.857
		s4.212-31.556,11.594-44.857C50.989,41.077,32.622,60.521,32.622,84.187z"
        />
        <path
          id="XMLID_105_"
          d="M93.489,160.825c-5.17-1.077-10.482-1.639-15.867-1.639C34.821,159.186,0,194.008,0,236.809
		c0,8.284,6.716,15,15,15h1.025C27.627,211.581,56.218,178.487,93.489,160.825z"
        />
        <path
          id="XMLID_106_"
          d="M104.216,47.915c-7.289,10.25-11.594,22.764-11.594,36.271s4.305,26.021,11.594,36.271
		c11.383,16.006,30.065,26.478,51.157,26.478c34.601,0,62.75-28.149,62.75-62.75s-28.149-62.75-62.75-62.75
		C134.28,21.437,115.599,31.909,104.216,47.915z"
        />
      </g>
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg
      height="17px"
      width="17px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 330 330"
      xmlSpace="preserve"
      fill="#949496"
      className="group-hover:fill-white group-hover:scale-110 transition-all ease-in-out"
    >
      <path
        id="XMLID_6_"
        d="M165,0C74.019,0,0,74.019,0,165s74.019,165,165,165s165-74.019,165-165S255.981,0,165,0z M205.606,234.394
	c5.858,5.857,5.858,15.355,0,21.213C202.678,258.535,198.839,260,195,260s-7.678-1.464-10.606-4.394l-80-79.998
	c-2.813-2.813-4.394-6.628-4.394-10.606c0-3.978,1.58-7.794,4.394-10.607l80-80.002c5.857-5.858,15.355-5.858,21.213,0
	c5.858,5.857,5.858,15.355,0,21.213l-69.393,69.396L205.606,234.394z"
      />
    </svg>
  );
}

export function FileIcon({
  width = "100px",
  height = "100px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="2 2 20 21"
      fill="none"
      fillRule="evenodd"
      xmlns="http://www.w3.org/2000/svg"
      className="group-hover:fill-white/80 group-hover:scale-110 transition-all ease-in-out"
    >
      <path
        d="M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z"
        fill="#D9D9D9"
        strokeWidth={1}
      />
      <path
        d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M14 17H8M16 13H8M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
      />
    </svg>
  );
}

export function VideoIcon() {
  return (
    <svg
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="group-hover:stroke-white/80 group-hover:scale-110 transition-all ease-in-out"
    >
      <path
        d="M19.5617 7C19.7904 5.69523 18.7863 4.5 17.4617 4.5H6.53788C5.21323 4.5 4.20922 5.69523 4.43784 7"
        strokeWidth="1.5"
        stroke="#D9D9D9"
      />
      <path
        d="M17.4999 4.5C17.5283 4.24092 17.5425 4.11135 17.5427 4.00435C17.545 2.98072 16.7739 2.12064 15.7561 2.01142C15.6497 2 15.5194 2 15.2588 2H8.74099C8.48035 2 8.35002 2 8.24362 2.01142C7.22584 2.12064 6.45481 2.98072 6.45704 4.00434C6.45727 4.11135 6.47146 4.2409 6.49983 4.5"
        strokeWidth="1.5"
        stroke="#D9D9D9"
      />
      <path
        d="M21.1935 16.793C20.8437 19.2739 20.6689 20.5143 19.7717 21.2572C18.8745 22 17.5512 22 14.9046 22H9.09536C6.44881 22 5.12553 22 4.22834 21.2572C3.33115 20.5143 3.15626 19.2739 2.80648 16.793L2.38351 13.793C1.93748 10.6294 1.71447 9.04765 2.66232 8.02383C3.61017 7 5.29758 7 8.67239 7H15.3276C18.7024 7 20.3898 7 21.3377 8.02383C22.0865 8.83268 22.1045 9.98979 21.8592 12"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#D9D9D9"
      />
      <path
        d="M14.5812 13.6159C15.1396 13.9621 15.1396 14.8582 14.5812 15.2044L11.2096 17.2945C10.6669 17.6309 10 17.1931 10 16.5003L10 12.32C10 11.6273 10.6669 11.1894 11.2096 11.5258L14.5812 13.6159Z"
        strokeWidth="1.5"
        fill="#D9D9D9"
      />
    </svg>
  );
}

export function CallIcon() {
  return (
    <svg
      height="25px"
      width="25px"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 473.806 473.806"
      xmlSpace="preserve"
      fill="#ababab"
      className="group-hover:fill-white group-hover:scale-110 transition-all ease-in-out"
    >
      <g>
        <g>
          <path
            d="M374.456,293.506c-9.7-10.1-21.4-15.5-33.8-15.5c-12.3,0-24.1,5.3-34.2,15.4l-31.6,31.5c-2.6-1.4-5.2-2.7-7.7-4
			c-3.6-1.8-7-3.5-9.9-5.3c-29.6-18.8-56.5-43.3-82.3-75c-12.5-15.8-20.9-29.1-27-42.6c8.2-7.5,15.8-15.3,23.2-22.8
			c2.8-2.8,5.6-5.7,8.4-8.5c21-21,21-48.2,0-69.2l-27.3-27.3c-3.1-3.1-6.3-6.3-9.3-9.5c-6-6.2-12.3-12.6-18.8-18.6
			c-9.7-9.6-21.3-14.7-33.5-14.7s-24,5.1-34,14.7c-0.1,0.1-0.1,0.1-0.2,0.2l-34,34.3c-12.8,12.8-20.1,28.4-21.7,46.5
			c-2.4,29.2,6.2,56.4,12.8,74.2c16.2,43.7,40.4,84.2,76.5,127.6c43.8,52.3,96.5,93.6,156.7,122.7c23,10.9,53.7,23.8,88,26
			c2.1,0.1,4.3,0.2,6.3,0.2c23.1,0,42.5-8.3,57.7-24.8c0.1-0.2,0.3-0.3,0.4-0.5c5.2-6.3,11.2-12,17.5-18.1c4.3-4.1,8.7-8.4,13-12.9
			c9.9-10.3,15.1-22.3,15.1-34.6c0-12.4-5.3-24.3-15.4-34.3L374.456,293.506z M410.256,398.806
			C410.156,398.806,410.156,398.906,410.256,398.806c-3.9,4.2-7.9,8-12.2,12.2c-6.5,6.2-13.1,12.7-19.3,20
			c-10.1,10.8-22,15.9-37.6,15.9c-1.5,0-3.1,0-4.6-0.1c-29.7-1.9-57.3-13.5-78-23.4c-56.6-27.4-106.3-66.3-147.6-115.6
			c-34.1-41.1-56.9-79.1-72-119.9c-9.3-24.9-12.7-44.3-11.2-62.6c1-11.7,5.5-21.4,13.8-29.7l34.1-34.1c4.9-4.6,10.1-7.1,15.2-7.1
			c6.3,0,11.4,3.8,14.6,7c0.1,0.1,0.2,0.2,0.3,0.3c6.1,5.7,11.9,11.6,18,17.9c3.1,3.2,6.3,6.4,9.5,9.7l27.3,27.3
			c10.6,10.6,10.6,20.4,0,31c-2.9,2.9-5.7,5.8-8.6,8.6c-8.4,8.6-16.4,16.6-25.1,24.4c-0.2,0.2-0.4,0.3-0.5,0.5
			c-8.6,8.6-7,17-5.2,22.7c0.1,0.3,0.2,0.6,0.3,0.9c7.1,17.2,17.1,33.4,32.3,52.7l0.1,0.1c27.6,34,56.7,60.5,88.8,80.8
			c4.1,2.6,8.3,4.7,12.3,6.7c3.6,1.8,7,3.5,9.9,5.3c0.4,0.2,0.8,0.5,1.2,0.7c3.4,1.7,6.6,2.5,9.9,2.5c8.3,0,13.5-5.2,15.2-6.9
			l34.2-34.2c3.4-3.4,8.8-7.5,15.1-7.5c6.2,0,11.3,3.9,14.4,7.3c0.1,0.1,0.1,0.1,0.2,0.2l55.1,55.1
			C420.456,377.706,420.456,388.206,410.256,398.806z"
          />
          <path
            d="M256.056,112.706c26.2,4.4,50,16.8,69,35.8s31.3,42.8,35.8,69c1.1,6.6,6.8,11.2,13.3,11.2c0.8,0,1.5-0.1,2.3-0.2
			c7.4-1.2,12.3-8.2,11.1-15.6c-5.4-31.7-20.4-60.6-43.3-83.5s-51.8-37.9-83.5-43.3c-7.4-1.2-14.3,3.7-15.6,11
			S248.656,111.506,256.056,112.706z"
          />
          <path
            d="M473.256,209.006c-8.9-52.2-33.5-99.7-71.3-137.5s-85.3-62.4-137.5-71.3c-7.3-1.3-14.2,3.7-15.5,11
			c-1.2,7.4,3.7,14.3,11.1,15.6c46.6,7.9,89.1,30,122.9,63.7c33.8,33.8,55.8,76.3,63.7,122.9c1.1,6.6,6.8,11.2,13.3,11.2
			c0.8,0,1.5-0.1,2.3-0.2C469.556,223.306,474.556,216.306,473.256,209.006z"
          />
        </g>
      </g>
    </svg>
  );
}

export function AudioIcon() {
  return (
    <svg
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className="group-hover:scale-110 transition-all ease-in-out"
    >
      <path d="M9.66984 13.9219C8.92984 13.9219 8.33984 14.5219 8.33984 15.2619C8.33984 16.0019 8.93984 16.5919 9.66984 16.5919C10.4098 16.5919 11.0098 15.9919 11.0098 15.2619C11.0098 14.5219 10.4098 13.9219 9.66984 13.9219Z" />
      <path
        d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM17.12 9.8C17.12 10.41 16.86 10.95 16.42 11.27C16.14 11.47 15.8 11.58 15.44 11.58C15.23 11.58 15.02 11.54 14.8 11.47L12.51 10.71C12.5 10.71 12.48 10.7 12.47 10.69V15.25C12.47 16.79 11.21 18.05 9.67 18.05C8.13 18.05 6.87 16.79 6.87 15.25C6.87 13.71 8.13 12.45 9.67 12.45C10.16 12.45 10.61 12.59 11.01 12.8V8.63V8.02C11.01 7.41 11.27 6.87 11.71 6.55C12.16 6.23 12.75 6.15 13.33 6.35L15.62 7.11C16.48 7.4 17.13 8.3 17.13 9.2V9.8H17.12Z"
        fill="#D9D9D9"
        className="group-hover:fill-[#e6e7e8]"
      />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="group-hover:scale-110 transition-all ease-in-out"
    >
      <title>Chat Details</title>
      <path
        d="M12 17V11"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#D9D9D9"
        className="group-hover:stroke-[#e6e7e8]"
      />
      <circle
        cx="1"
        cy="1"
        r="1"
        transform="matrix(1 0 0 -1 11 9)"
        fill="#D9D9D9"
        className="group-hover:fill-[#e6e7e8]"
      />
      <path
        d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="#D9D9D9"
        className="group-hover:stroke-[#e6e7e8]"
      />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="group-hover:scale-110 transition-all ease-in-out"
    >
      <title>Edit Message</title>
      <path
        d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4M9.35443 12.4346L15.9429 5.92003C16.4684 5.40046 17.3049 5.3718 17.8647 5.85418C18.4812 6.38542 18.5247 7.32554 17.96 7.91149L11.481 14.6335L9 15L9.35443 12.4346Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#D9D9D9"
        className="group-hover:stroke-[#e6e7e8]"
      />
    </svg>
  );
}